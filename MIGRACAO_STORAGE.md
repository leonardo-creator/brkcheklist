# ✅ Migração do OneDrive para Storage Genérico

## 🎯 O Que Foi Feito

O sistema foi completamente migrado do **OneDrive** para um **sistema de storage genérico** configurável via variáveis de ambiente no `.env`.

## 📝 Mudanças Implementadas

### 1. Novo Sistema de Storage (`src/lib/storage.ts`)

Criado um sistema genérico que suporta:
- ✅ **Storage Customizado (HTTP API)** - Para VPS com API própria
- ✅ **AWS S3** - Compatível com S3 e serviços compatíveis (MinIO, DigitalOcean Spaces, etc)
- ✅ **Azure Blob Storage** - Para Azure
- ✅ **Storage Local** - Filesystem local

### 2. Upload Route Atualizado (`src/app/api/upload/route.ts`)

- ❌ Removido: `OneDriveService` e `getOneDriveAccessToken`
- ✅ Adicionado: `createStorageService()` que detecta automaticamente o tipo de storage
- ✅ Simplificado: Upload agora usa apenas `storageService.uploadFile()`

### 3. Configuração via `.env`

Todas as configurações agora são feitas via variáveis de ambiente:

```env
# Tipo de storage: 'custom', 's3', 'azure', ou 'local'
STORAGE_TYPE=custom

# Endpoint da API (para custom) ou storage
STORAGE_ENDPOINT=https://storage.vps.com/api

# Token de autenticação (opcional)
STORAGE_ACCESS_KEY=seu_token_aqui

# Caminho base no storage
STORAGE_PATH=BRK_Inspecoes

# URL base para acesso público
STORAGE_BASE_URL=https://storage.vps.com/files
```

## 🔧 Como Configurar

### Para Storage Customizado na VPS (Recomendado)

Adicione no seu `.env` (linhas 45-46):

```env
STORAGE_TYPE=custom
STORAGE_ENDPOINT=https://storage.vps.com/api
STORAGE_ACCESS_KEY=seu_token_aqui
STORAGE_PATH=BRK_Inspecoes
STORAGE_BASE_URL=https://storage.vps.com/files
```

### API Esperada pelo Storage Customizado

O storage customizado deve expor uma API HTTP com:

**POST `/upload`**
- Recebe FormData com:
  - `file`: Buffer do arquivo
  - `folder`: Caminho da pasta (opcional)
  - `basePath`: Caminho base (opcional)
  - Header `Authorization: Bearer {STORAGE_ACCESS_KEY}` (opcional)
- Retorna JSON: `{ url, id, fileId, path, publicUrl }`

**DELETE `/delete/{fileId}`**
- Deleta arquivo pelo ID
- Header `Authorization: Bearer {STORAGE_ACCESS_KEY}` (opcional)

## 📦 Dependências

As dependências são carregadas dinamicamente apenas quando necessário:

- **S3**: `npm install aws-sdk` (apenas se usar STORAGE_TYPE=s3)
- **Azure**: `npm install @azure/storage-blob` (apenas se usar STORAGE_TYPE=azure)
- **Custom**: `npm install form-data` (apenas se usar STORAGE_TYPE=custom)
- **Local**: Nenhuma dependência adicional

## ✅ Vantagens

1. ✅ **Flexível**: Suporta múltiplos tipos de storage
2. ✅ **Configurável**: Tudo via `.env`, sem código
3. ✅ **Sem Dependências Desnecessárias**: Carrega apenas o que precisa
4. ✅ **Compatível**: Mantém a mesma interface, apenas muda a implementação
5. ✅ **VPS-Friendly**: Perfeito para storage compartilhado na VPS

## 🧪 Testando

1. Configure as variáveis no `.env`
2. Reinicie o servidor: `npm run dev`
3. Faça upload de uma imagem
4. Verifique se o arquivo foi salvo no storage configurado

## 📚 Documentação

Consulte `STORAGE_CONFIG.md` para documentação completa de todos os tipos de storage suportados.

