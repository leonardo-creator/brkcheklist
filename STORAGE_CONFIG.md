# Configuração de Storage

Este projeto suporta múltiplos tipos de storage configuráveis via variáveis de ambiente no `.env`.

## 📋 Variáveis de Ambiente

### Configuração Básica (Obrigatória)

```env
# Tipo de storage: 's3', 'azure', 'local', ou 'custom'
STORAGE_TYPE=custom

# Caminho base no storage
STORAGE_PATH=BRK_Inspecoes

# URL base para acesso público (opcional)
STORAGE_BASE_URL=https://storage.exemplo.com
```

## 🔧 Tipos de Storage Suportados

### 1. Storage Customizado (HTTP API) - Recomendado para VPS

Para usar um storage customizado na VPS que expõe uma API HTTP:

```env
STORAGE_TYPE=custom
STORAGE_ENDPOINT=https://storage.vps.com/api
STORAGE_ACCESS_KEY=seu_token_aqui
STORAGE_PATH=BRK_Inspecoes
STORAGE_BASE_URL=https://storage.vps.com/files
```

**API Esperada:**
- `POST /upload` - Recebe FormData com:
  - `file`: Buffer do arquivo
  - `folder`: Caminho da pasta (opcional)
  - `basePath`: Caminho base (opcional)
  - Header `Authorization: Bearer {STORAGE_ACCESS_KEY}` (opcional)

- `DELETE /delete/{fileId}` - Deleta arquivo
- Retorna JSON: `{ url, id, fileId, path, publicUrl }`

### 2. AWS S3 ou S3-Compatible

```env
STORAGE_TYPE=s3
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=brk-inspecoes
STORAGE_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
STORAGE_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STORAGE_REGION=us-east-1
STORAGE_PATH=BRK_Inspecoes
```

**Para S3-Compatible (MinIO, DigitalOcean Spaces, etc):**
```env
STORAGE_TYPE=s3
STORAGE_ENDPOINT=https://nyc3.digitaloceanspaces.com
STORAGE_BUCKET=brk-inspecoes
STORAGE_ACCESS_KEY=seu_access_key
STORAGE_SECRET_KEY=seu_secret_key
STORAGE_REGION=nyc3
```

### 3. Azure Blob Storage

```env
STORAGE_TYPE=azure
STORAGE_ENDPOINT=https://contoso.blob.core.windows.net
STORAGE_ACCESS_KEY=DefaultEndpointsProtocol=https;AccountName=...
STORAGE_BUCKET=brk-inspecoes
STORAGE_PATH=BRK_Inspecoes
```

### 4. Storage Local (Filesystem)

```env
STORAGE_TYPE=local
STORAGE_ENDPOINT=/var/www/uploads
STORAGE_PATH=BRK_Inspecoes
STORAGE_BASE_URL=https://exemplo.com/uploads
```

## 📦 Dependências Necessárias

Para usar S3:
```bash
npm install aws-sdk
```

Para usar Azure:
```bash
npm install @azure/storage-blob
```

Para usar Custom (já incluído):
```bash
npm install form-data node-fetch
```

## ✅ Exemplo Completo para VPS

```env
# Storage Customizado na VPS
STORAGE_TYPE=custom
STORAGE_ENDPOINT=https://storage.vps.com/api
STORAGE_ACCESS_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STORAGE_PATH=BRK_Inspecoes
STORAGE_BASE_URL=https://storage.vps.com/files
```

## 🔄 Migração do OneDrive

O sistema foi migrado do OneDrive para um storage genérico. Todas as referências ao OneDrive foram removidas e substituídas pelo novo sistema de storage.

## 🧪 Testando

1. Configure as variáveis no `.env`
2. Reinicie o servidor
3. Faça upload de uma imagem
4. Verifique se o arquivo foi salvo no storage configurado

