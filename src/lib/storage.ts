/**
 * Serviço de Storage Genérico
 * Suporta múltiplos tipos de storage configuráveis via .env
 * Substitui o OneDrive por um storage customizado na VPS
 */

import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string; // URL pública do arquivo
  fileName: string;
  fileId?: string; // ID do arquivo no storage (opcional)
  size?: number;
  originalSize?: number;
}

export interface StorageConfig {
  type: 's3' | 'azure' | 'local' | 'custom';
  endpoint?: string;
  bucket?: string;
  accessKey?: string;
  secretKey?: string;
  region?: string;
  baseUrl?: string; // URL base para acesso público
  path?: string; // Caminho base no storage
}

/**
 * Classe abstrata para diferentes implementações de storage
 */
export abstract class StorageService {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  /**
   * Faz upload de um arquivo
   */
  abstract uploadFile(
    buffer: Buffer,
    fileName: string,
    folderPath?: string,
    mimeType?: string
  ): Promise<UploadResult>;

  /**
   * Deleta um arquivo
   */
  abstract deleteFile(fileId: string): Promise<void>;

  /**
   * Obtém URL pública de um arquivo
   */
  abstract getPublicUrl(fileId: string): string;
}

/**
 * Factory para criar instância do storage baseado nas variáveis do .env
 */
export function createStorageService(): StorageService {
  const storageType = (process.env.STORAGE_TYPE || 'local').toLowerCase();
  const storagePath = process.env.STORAGE_PATH || 'BRK_Inspecoes';

  const config: StorageConfig = {
    type: storageType as 's3' | 'azure' | 'local' | 'custom',
    endpoint: process.env.STORAGE_ENDPOINT,
    bucket: process.env.STORAGE_BUCKET,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    region: process.env.STORAGE_REGION,
    baseUrl: process.env.STORAGE_BASE_URL,
    path: storagePath,
  };

  switch (storageType) {
    case 's3':
      return new S3StorageService(config);
    case 'azure':
      return new AzureStorageService(config);
    case 'local':
      return new LocalStorageService(config);
    case 'custom':
      return new CustomStorageService(config);
    default:
      console.warn(`⚠️ Tipo de storage desconhecido: ${storageType}, usando local`);
      return new LocalStorageService(config);
  }
}

/**
 * Implementação para AWS S3
 */
class S3StorageService extends StorageService {
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    folderPath?: string,
    mimeType = 'image/jpeg'
  ): Promise<UploadResult> {
    if (!this.config.endpoint || !this.config.bucket || !this.config.accessKey || !this.config.secretKey) {
      throw new Error('Configuração S3 incompleta. Verifique STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY');
    }

    // Implementação S3 usando AWS SDK (instalar: npm install aws-sdk)
    let AWS;
    try {
      // Dynamic import to avoid bundling issues
      AWS = await import('aws-sdk').then(m => m.default || m);
    } catch {
      throw new Error('aws-sdk não instalado. Execute: npm install aws-sdk');
    }
    const s3 = new AWS.S3({
      endpoint: this.config.endpoint,
      accessKeyId: this.config.accessKey,
      secretAccessKey: this.config.secretKey,
      region: this.config.region || 'us-east-1',
      s3ForcePathStyle: true, // Para S3-compatible storage
    });

    const key = folderPath ? `${folderPath}/${fileName}` : fileName;
    const fullKey = this.config.path ? `${this.config.path}/${key}` : key;

    const result = await s3
      .upload({
        Bucket: this.config.bucket,
        Key: fullKey,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read', // Tornar público
      })
      .promise();

    const publicUrl = this.config.baseUrl
      ? `${this.config.baseUrl}/${fullKey}`
      : result.Location;

    return {
      url: publicUrl,
      fileName,
      fileId: result.Key,
      size: buffer.length,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    let AWS;
    try {
      // Dynamic import to avoid bundling issues
      AWS = await import('aws-sdk').then(m => m.default || m);
    } catch {
      throw new Error('aws-sdk não instalado. Execute: npm install aws-sdk');
    }
    const s3 = new AWS.S3({
      endpoint: this.config.endpoint,
      accessKeyId: this.config.accessKey,
      secretAccessKey: this.config.secretKey,
      region: this.config.region || 'us-east-1',
    });

    await s3
      .deleteObject({
        Bucket: this.config.bucket!,
        Key: fileId,
      })
      .promise();
  }

  getPublicUrl(fileId: string): string {
    if (this.config.baseUrl) {
      return `${this.config.baseUrl}/${fileId}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region || 'us-east-1'}.amazonaws.com/${fileId}`;
  }
}

/**
 * Implementação para Azure Blob Storage
 */
class AzureStorageService extends StorageService {
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    folderPath?: string,
    mimeType = 'image/jpeg'
  ): Promise<UploadResult> {
    if (!this.config.endpoint || !this.config.accessKey) {
      throw new Error('Configuração Azure incompleta. Verifique STORAGE_ENDPOINT e STORAGE_ACCESS_KEY');
    }

    let BlobServiceClient;
    try {
      // Dynamic import to avoid bundling issues
      const azure = await import('@azure/storage-blob');
      BlobServiceClient = azure.BlobServiceClient;
    } catch {
      throw new Error('@azure/storage-blob não instalado. Execute: npm install @azure/storage-blob');
    }
    const connectionString = this.config.accessKey; // Pode ser connection string ou SAS token
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    const containerName = this.config.bucket || 'brk-inspecoes';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const key = folderPath ? `${folderPath}/${fileName}` : fileName;
    const fullKey = this.config.path ? `${this.config.path}/${key}` : key;

    const blockBlobClient = containerClient.getBlockBlobClient(fullKey);

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    const publicUrl = blockBlobClient.url;

    return {
      url: publicUrl,
      fileName,
      fileId: fullKey,
      size: buffer.length,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    let BlobServiceClient;
    try {
      // Dynamic import to avoid bundling issues
      const azure = await import('@azure/storage-blob');
      BlobServiceClient = azure.BlobServiceClient;
    } catch {
      throw new Error('@azure/storage-blob não instalado. Execute: npm install @azure/storage-blob');
    }
    const connectionString = this.config.accessKey!;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = this.config.bucket || 'brk-inspecoes';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileId);
    await blockBlobClient.delete();
  }

  getPublicUrl(fileId: string): string {
    return `${this.config.endpoint}/${this.config.bucket || 'brk-inspecoes'}/${fileId}`;
  }
}

/**
 * Implementação para Storage Local (filesystem)
 */
class LocalStorageService extends StorageService {
  private fs = fs;
  private path = path;

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    folderPath?: string,
    mimeType = 'image/jpeg'
  ): Promise<UploadResult> {
    // Determina o diretório base
    const baseDir = this.config.endpoint || process.cwd() + '/public/uploads';
    const storagePath = this.config.path || 'BRK_Inspecoes';
    
    const fullPath = folderPath
      ? this.path.join(baseDir, storagePath, folderPath)
      : this.path.join(baseDir, storagePath);

    // Cria diretórios se não existirem
    if (!this.fs.existsSync(fullPath)) {
      this.fs.mkdirSync(fullPath, { recursive: true });
    }

    const filePath = this.path.join(fullPath, fileName);
    this.fs.writeFileSync(filePath, buffer);

    // Gera URL pública
    const relativePath = this.path.relative(process.cwd() + '/public', filePath).replace(/\\/g, '/');
    const publicUrl = this.config.baseUrl
      ? `${this.config.baseUrl}/${relativePath}`
      : `/${relativePath}`;

    return {
      url: publicUrl,
      fileName,
      fileId: filePath,
      size: buffer.length,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    if (this.fs.existsSync(fileId)) {
      this.fs.unlinkSync(fileId);
    }
  }

  getPublicUrl(fileId: string): string {
    const relativePath = this.path.relative(process.cwd() + '/public', fileId).replace(/\\/g, '/');
    return this.config.baseUrl ? `${this.config.baseUrl}/${relativePath}` : `/${relativePath}`;
  }
}

/**
 * Implementação para Storage Customizado (HTTP API)
 * Para storage customizado na VPS que expõe uma API HTTP
 */
class CustomStorageService extends StorageService {
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    folderPath?: string,
    mimeType = 'image/jpeg'
  ): Promise<UploadResult> {
    if (!this.config.endpoint) {
      throw new Error('STORAGE_ENDPOINT é obrigatório para storage customizado');
    }

    // Cria FormData para upload
    let FormData;
    try {
      // Dynamic import to avoid bundling issues
      const formDataModule = await import('form-data');
      FormData = formDataModule.default || formDataModule;
    } catch {
      throw new Error('form-data não instalado. Execute: npm install form-data');
    }
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: fileName,
      contentType: mimeType,
    });

    if (folderPath) {
      formData.append('folder', folderPath);
    }

    if (this.config.path) {
      formData.append('basePath', this.config.path);
    }

    // Headers de autenticação se necessário
    const headers: Record<string, string> = {
      ...formData.getHeaders(),
    };

    if (this.config.accessKey) {
      headers['Authorization'] = `Bearer ${this.config.accessKey}`;
    }

    // Faz upload via HTTP (usa fetch nativo do Node 18+)
    const response = await fetch(`${this.config.endpoint}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro no upload: ${error}`);
    }

    const result = await response.json();

    return {
      url: result.url || result.publicUrl || result.path,
      fileName,
      fileId: result.id || result.fileId || fileName,
      size: buffer.length,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('STORAGE_ENDPOINT é obrigatório');
    }

    const headers: Record<string, string> = {};
    if (this.config.accessKey) {
      headers['Authorization'] = `Bearer ${this.config.accessKey}`;
    }

    // Usa fetch nativo do Node 18+
    const response = await fetch(`${this.config.endpoint}/delete/${fileId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar arquivo: ${response.statusText}`);
    }
  }

  getPublicUrl(fileId: string): string {
    if (this.config.baseUrl) {
      return `${this.config.baseUrl}/${fileId}`;
    }
    return `${this.config.endpoint}/file/${fileId}`;
  }
}

