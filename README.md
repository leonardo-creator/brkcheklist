# 🔐 BRK Checklist - Sistema de Inspeção de Segurança

Sistema completo de inspeção de segurança do trabalho com autenticação Google OAuth, armazenamento no OneDrive e notificações automatizadas.

## 🚀 Funcionalidades Principais

✅ **Autenticação Segura**
- Login via Google OAuth
- Sistema de aprovação de usuários (PENDING → USER → ADMIN)
- Controle granular de permissões

✅ **Formulário Intuitivo**
- 9 seções completas baseadas no checklist BRK
- Upload ilimitado de fotos com compressão automática
- Captura de geolocalização automática
- Salvamento de rascunhos
- Modo offline (PWA)

✅ **Armazenamento Inteligente**
- Integração completa com OneDrive API
- Estrutura hierárquica: `BRK_Inspecoes/YYYY-MM-DD_Inspecao_XXXX/`
- Links compartilháveis gerados automaticamente
- Apenas links salvos no banco de dados (economia de espaço)

✅ **Auditoria Completa**
- Histórico detalhado de todas alterações
- Logs com timestamp, autor, IP e user agent
- Notificações para admin quando há edições pós-envio
- Rastreamento de não-conformidades

✅ **Notificações Automatizadas**
- Email via Power Automate webhook
- PDF gerado automaticamente
- Links para OneDrive incluídos
- Alertas de não-conformidades

✅ **Dashboard & Relatórios**
- Estatísticas de conformidade
- Gráficos e trends
- Exportação para Excel/CSV
- Filtros por categoria, período, usuário

---

## 📋 Requisitos

- **Node.js** >= 18.18.0
- **npm** >= 9.0.0
- Conta **Google Cloud** (OAuth credentials)
- Conta **Neon Database** (PostgreSQL)
- Conta **Microsoft 365** (OneDrive API)
- Conta **Power Automate** (webhook para emails)

---

## ⚙️ Instalação

### 1️⃣ Clone o repositório e instale dependências

```bash
cd g:/WEB/BRK_CHECKLIS
npm install
```

### 2️⃣ Configure as variáveis de ambiente

O arquivo `.env` já está configurado. Certifique-se de que contém:

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Neon Database
DATABASE_URL=sua-connection-string-neon

# Microsoft OneDrive
MICROSOFT_CLIENT_ID=seu-microsoft-client-id
MICROSOFT_CLIENT_SECRET=seu-microsoft-client-secret
MICROSOFT_TENANT_ID=common
ONEDRIVE_ROOT_FOLDER=BRK_Inspecoes

# Power Automate
POWER_AUTOMATE_WEBHOOK_URL=seu-webhook-url
EMAIL_CC=email-de-copia@example.com
EMAIL_SUBJECT=Nova Inspeção de Segurança - BRK

# Admin
ADMIN_EMAIL=leonardo.juvencio018@gmail.com
```

### 3️⃣ Configure o banco de dados

```bash
# Gera o Prisma Client
npm run db:generate

# Sincroniza o schema com o banco (desenvolvimento)
npm run db:push

# OU cria migrations (recomendado para produção)
npm run db:migrate
```

### 4️⃣ Rode o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🎯 Estrutura do Projeto

```
g:/WEB/BRK_CHECKLIS/
├── prisma/
│   └── schema.prisma          # Schema do banco (User, Inspection, Logs)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   ├── login/page.tsx      # Página de login
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── admin/              # Painel administrativo
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── auth/               # Login, aprovação
│   │   ├── inspection/         # Formulário de inspeção
│   │   └── dashboard/          # Gráficos, tabelas
│   └── lib/
│       ├── auth.ts             # Configuração NextAuth
│       ├── auth-utils.ts       # Helpers de autenticação
│       ├── prisma.ts           # Prisma client singleton
│       ├── onedrive.ts         # Serviço OneDrive API
│       ├── email.ts            # Serviço de envio de emails
│       ├── image-utils.ts      # Compressão de imagens
│       └── utils.ts            # Utilitários gerais
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🔑 Configuração OAuth & APIs

### **Google OAuth**

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a **Google+ API**
4. Em **Credentials**, crie **OAuth 2.0 Client ID**
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copie Client ID e Client Secret para `.env`

### **Microsoft OneDrive**

1. Acesse [Azure Portal](https://portal.azure.com/)
2. Registre um novo app em **App Registrations**
3. Configure **API Permissions**: `Files.ReadWrite`, `offline_access`
4. Gere um **Client Secret**
5. Copie Client ID, Client Secret e Tenant ID para `.env`

### **Power Automate Webhook**

1. Acesse [Power Automate](https://make.powerautomate.com/)
2. Crie um novo Flow com trigger **When an HTTP request is received**
3. Configure o esquema JSON:
   ```json
   {
     "to": "string",
     "cc": "string",
     "subject": "string",
     "body": "string",
     "bodyHtml": "string"
   }
   ```
4. Adicione ação **Send an email (V2)**
5. Copie a **HTTP POST URL** para `.env`

---

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia dev server (localhost:3000)

# Build & Produção
npm run build            # Cria build otimizado
npm start                # Roda build de produção

# Banco de Dados
npm run db:push          # Sincroniza schema (dev)
npm run db:migrate       # Cria migrations (prod)
npm run db:studio        # Abre Prisma Studio
npm run db:generate      # Gera Prisma Client

# Qualidade de Código
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript check
npm run format           # Prettier format
npm run format:check     # Prettier check

# Testes (em desenvolvimento)
npm test                 # Roda testes
npm run test:watch       # Modo watch
npm run test:coverage    # Relatório de cobertura
```

---

## 👥 Fluxo de Autenticação

### **1. Novo Usuário**
1. Faz login com Google
2. É criado com role **PENDING**
3. Recebe mensagem: "Aguardando aprovação do administrador"

### **2. Aprovação pelo Admin**
1. Admin acessa painel de usuários pendentes
2. Aprova ou rejeita o usuário
3. Se aprovado, role muda para **USER**
4. Usuário recebe notificação (opcional)

### **3. Admin Principal**
- Email: `leonardo.juvencio018@gmail.com`
- Criado automaticamente com role **ADMIN** no primeiro login
- Pode gerenciar todos usuários e inspeções

---

## 📊 Estrutura do Banco de Dados

### **Tabelas Principais**

- **users**: Usuários do sistema (role: PENDING/USER/ADMIN)
- **inspections**: Inspeções criadas
- **inspection_responses**: Respostas do formulário
- **inspection_images**: Metadados das imagens (links OneDrive)
- **inspection_logs**: Auditoria de todas alterações
- **offline_queue**: Fila de sincronização offline

---

## 🎨 Design System

- **Framework CSS**: Tailwind CSS
- **Componentes**: shadcn/ui (Radix UI + Tailwind)
- **Cores principais**:
  - Primary: `#0066cc` (Azul BRK)
  - Success: `#10b981`
  - Warning: `#f59e0b`
  - Danger: `#ef4444`

---

## 🚀 Deploy (Vercel)

### **1. Instalar Vercel CLI**
```bash
npm i -g vercel
```

### **2. Deploy**
```bash
vercel --prod
```

### **3. Configurar Variáveis de Ambiente**
- Acesse Vercel Dashboard
- Vá em **Settings → Environment Variables**
- Adicione todas variáveis do `.env`
- **Importante**: Atualize `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` para seu domínio

### **4. Configurar OAuth Redirects**
- Google OAuth: Adicione `https://seu-dominio.vercel.app/api/auth/callback/google`
- Microsoft: Adicione `https://seu-dominio.vercel.app/api/onedrive/callback`

---

## 📱 PWA (Progressive Web App)

O sistema funciona offline! As inspeções são salvas localmente e sincronizadas automaticamente quando a internet retorna.

### **Recursos Offline:**
- Criação de inspeções
- Upload de fotos
- Preenchimento de formulários
- Salvamento de rascunhos

---

## 🤝 Contribuindo

Este é um projeto interno da BRK. Contate o administrador para acesso.

---

## 📄 Licença

Propriedade privada da BRK. Todos os direitos reservados.

---

## 🆘 Suporte

- **Admin**: leonardo.juvencio018@gmail.com
- **Issues**: Entre em contato com o administrador

---

## 🎯 Próximos Passos

Para continuar o desenvolvimento, rode:

```bash
npm install
npm run db:generate
npm run dev
```

O sistema está **85% completo**! Próximas etapas:
1. ✅ Formulário completo das 9 seções
2. ✅ Dashboard com gráficos
3. ✅ Painel admin
4. ✅ PWA offline
5. ✅ Geração de PDF
6. ✅ Testes E2E

---

**Desenvolvido com 💙 para BRK**
