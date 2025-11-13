import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { prisma } from '@/lib/prisma';

interface OneDriveConfig {
  accessToken: string;
}

interface UploadResult {
  id: string;
  name: string;
  webUrl: string;
  shareLink?: string;
  thumbnailUrl?: string;
}

/**
 * Serviço para integração com Microsoft OneDrive
 * Gerencia upload de arquivos, criação de pastas e geração de links
 */
export class OneDriveService {
  private client: Client;
  private rootFolder: string;

  constructor(config: OneDriveConfig) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, config.accessToken);
      },
    });
    this.rootFolder =
      process.env.ONEDRIVE_ROOT_FOLDER || 'BRK_Inspecoes';
  }

  /**
   * Cria a estrutura de pastas para uma inspeção
   * Estrutura: BRK_Inspecoes/YYYY-MM-DD_Inspecao_<number>/
   */
  async createInspectionFolder(
    inspectionNumber: number,
    date: Date
  ): Promise<{ folderId: string; folderPath: string }> {
    const dateStr = date.toISOString().split('T')[0];
    const folderName = `${dateStr}_Inspecao_${String(inspectionNumber).padStart(4, '0')}`;

    // Garante que a pasta raiz existe
    await this.ensureRootFolderExists();

    // Cria a pasta da inspeção
    const folder = await this.client
      .api(`/me/drive/root:/${this.rootFolder}/${folderName}`)
      .put({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      });

    return {
      folderId: folder.id,
      folderPath: `${this.rootFolder}/${folderName}`,
    };
  }

  /**
   * Faz upload de uma imagem para a pasta da inspeção
   */
  async uploadImage(
    buffer: Buffer,
    fileName: string,
    folderPath: string,
    mimeType: string
  ): Promise<UploadResult> {
    const uploadPath = `/me/drive/root:/${folderPath}/${fileName}:/content`;

    const response = await this.client
      .api(uploadPath)
      .header('Content-Type', mimeType)
      .put(buffer);

    // Gera link de compartilhamento
    const shareLink = await this.createShareLink(response.id);

    return {
      id: response.id,
      name: response.name,
      webUrl: response.webUrl,
      shareLink: shareLink.link.webUrl,
      thumbnailUrl: response.thumbnails?.[0]?.large?.url,
    };
  }

  /**
   * Upload em sessão para arquivos grandes (>4MB)
   */
  async uploadLargeFile(
    buffer: Buffer,
    fileName: string,
    folderPath: string,
    _mimeType: string
  ): Promise<UploadResult> {
    const uploadPath = `/me/drive/root:/${folderPath}/${fileName}:/createUploadSession`;

    const uploadSession = await this.client.api(uploadPath).post({
      item: {
        '@microsoft.graph.conflictBehavior': 'rename',
      },
    });

    // Upload em chunks de 320 KB
    const chunkSize = 327680;
    const totalSize = buffer.length;
    let uploadedBytes = 0;

    while (uploadedBytes < totalSize) {
      const chunk = buffer.slice(uploadedBytes, uploadedBytes + chunkSize);
      const contentRange = `bytes ${uploadedBytes}-${uploadedBytes + chunk.length - 1}/${totalSize}`;

      const response = await fetch(uploadSession.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.length.toString(),
          'Content-Range': contentRange,
        },
        body: chunk,
      });

      if (response.status === 200 || response.status === 201) {
        const result = await response.json();
        const shareLink = await this.createShareLink(result.id);

        return {
          id: result.id,
          name: result.name,
          webUrl: result.webUrl,
          shareLink: shareLink.link.webUrl,
        };
      }

      uploadedBytes += chunk.length;
    }

    throw new Error('Upload falhou');
  }

  /**
   * Cria um link de compartilhamento público (somente leitura)
   */
  async createShareLink(fileId: string): Promise<{ link: { webUrl: string } }> {
    return await this.client.api(`/me/drive/items/${fileId}/createLink`).post({
      type: 'view',
      scope: 'anonymous',
    });
  }

  /**
   * Cria link de compartilhamento para pasta inteira
   */
  async createFolderShareLink(folderId: string): Promise<string> {
    const result = await this.client
      .api(`/me/drive/items/${folderId}/createLink`)
      .post({
        type: 'view',
        scope: 'anonymous',
      });

    return result.link.webUrl;
  }

  /**
   * Garante que a pasta raiz existe
   */
  private async ensureRootFolderExists(): Promise<void> {
    try {
      await this.client.api(`/me/drive/root:/${this.rootFolder}`).get();
    } catch (error) {
      // Pasta não existe, criar
      await this.client.api('/me/drive/root/children').post({
        name: this.rootFolder,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      });
    }
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.client.api(`/me/drive/items/${fileId}`).delete();
  }

  /**
   * Lista arquivos de uma pasta
   */
  async listFiles(folderPath: string): Promise<unknown[]> {
    const response = await this.client
      .api(`/me/drive/root:/${folderPath}:/children`)
      .get();

    return response.value;
  }
}

/**
 * Renova access token usando refresh token
 */
export async function refreshOneDriveToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Falha ao renovar token: ${error.error_description || error.error || 'Erro desconhecido'}`
    );
  }

  return response.json();
}

/**
 * Obtem token de acesso do OneDrive usando OAuth 2.0
 * Busca do banco de dados e renova automaticamente se expirado
 */
export async function getOneDriveAccessToken(userId?: string): Promise<string> {
  if (!userId) {
    throw new Error(
      'User ID é obrigatório. Faça login no OneDrive em: /api/onedrive/login'
    );
  }

  // Buscar token do banco de dados
  const tokenData = await prisma.oneDriveToken.findUnique({
    where: { userId },
  });

  if (!tokenData) {
    throw new Error(
      'OneDrive não conectado. Conecte em: /api/onedrive/login'
    );
  }

  // Verificar se o token expirou (com margem de 5 minutos)
  const now = new Date();
  const expiresAt = new Date(tokenData.expiresAt);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (expiresAt <= fiveMinutesFromNow) {
    // Token expirado ou prestes a expirar, renovar
    try {
      const newTokens = await refreshOneDriveToken(tokenData.refreshToken);

      // Calcular nova data de expiração
      const newExpiresAt = new Date(
        Date.now() + newTokens.expires_in * 1000
      );

      // Atualizar no banco de dados
      await prisma.oneDriveToken.update({
        where: { userId },
        data: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        },
      });

      return newTokens.access_token;
    } catch (error) {
      console.error('Error refreshing OneDrive token:', error);
      throw new Error(
        'Falha ao renovar token do OneDrive. Reconecte em: /api/onedrive/login'
      );
    }
  }

  // Token ainda válido
  return tokenData.accessToken;
}

/**
 * Factory para criar instância do serviço
 */
export async function createOneDriveService(): Promise<OneDriveService> {
  const accessToken = await getOneDriveAccessToken();
  return new OneDriveService({ accessToken });
}
