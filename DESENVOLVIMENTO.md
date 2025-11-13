# 🚀 Sistema BRK - Inspeção de Segurança do Trabalho

Sistema completo de inspeções de segurança desenvolvido com **Next.js 15**, **TypeScript**, **Prisma ORM**, **Neon PostgreSQL**, e integração com **Google OAuth**, **OneDrive** e **Power Automate**.

---

## ✅ Status do Projeto

### **Implementado:**
- ✅ Autenticação Google OAuth com sistema de aprovação
- ✅ Banco de dados Neon PostgreSQL configurado
- ✅ Sistema de roles (PENDING/USER/ADMIN)
- ✅ Dashboard de usuário com estatísticas
- ✅ **Formulário completo de inspeção com 9 seções**
- ✅ Upload de imagens com compressão automática
- ✅ Captura de geolocalização GPS
- ✅ Auto-save de rascunhos (a cada 30s)
- ✅ API de inspeções (GET/POST)
- ✅ API de upload de imagens para OneDrive
- ✅ Página de detalhes da inspeção
- ✅ Audit logging completo
- ✅ Validação com Zod + React Hook Form
- ✅ UI responsiva com Tailwind CSS + shadcn/ui

### **Pendente:**
- 🔄 Salvamento completo das respostas no banco
- 🔄 Página de edição de inspeção
- 🔄 Admin dashboard com aprovação de usuários
- 🔄 Geração de PDF das inspeções
- 🔄 Service Worker para modo offline (PWA)
- 🔄 Notificações por email via Power Automate
- 🔄 Excel/CSV export

---

## 📋 Estrutura do Formulário de Inspeção

O formulário está dividido em **9 seções** conforme checklist BRK:

### **Seção 1: Planejamento e Integração da Equipe**
- 10 perguntas sobre integração, PDST, identificação da equipe
- **Obrigatório:** Upload de foto do PDST assinado

### **Seção 2: Permissão de Trabalho**
- 3 perguntas sobre emissão e validade da PT
- Upload opcional de foto da PT

### **Seção 3: Máquinas e Equipamentos Manuais**
- Perguntas condicionais baseadas no uso de equipamentos
- Lista de equipamentos utilizados
- 7 questões de segurança (inspeções, treinamentos, FDS, etc.)

### **Seção 4: Movimentação de Cargas**
- Perguntas condicionais sobre uso de máquinas pesadas
- 8 questões sobre operação segura, isolamento, acessórios
- Verificação de cunhas e calços

### **Seção 5: Equipamentos de Proteção Individual**
- 4 perguntas sobre uso e conservação de EPIs
- Bolsa para transporte
- Lanterna para atividades noturnas

### **Seção 6: Sinalização**
- 3 perguntas sobre sinalização do local
- Veículos barreira
- Dispositivos luminosos noturnos

### **Seção 7: Escavações**
- Perguntas condicionais para escavações >1,25m
- Escoramento, escadas/rampas de acesso
- Distância segura de materiais

### **Seção 8: Parecer Final**
- Avaliação da consciência da equipe (Sim/Não/Parcialmente)
- FORTALECER realizado e indicações
- Paralisações e não conformidades pendentes

### **Seção 9: Registro Fotográfico**
- Upload de até 20 fotos gerais
- **Mínimo 1 foto obrigatória**

---

## 🚀 Como Usar

### **1. Iniciar o servidor:**
```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3001**

### **2. Fazer login:**
- Acesse `/login`
- Entre com sua conta Google
- **Admin automático:** leonardo.juvencio018@gmail.com
- Outros usuários ficarão com status PENDING aguardando aprovação

### **3. Criar nova inspeção:**
- No dashboard, clique em **"Nova Inspeção"**
- Navegue pelas 9 seções usando os botões "Anterior" e "Próxima"
- **Capturar localização:** Clique no botão GPS para preencher automaticamente
- **Upload de imagens:** Arraste ou selecione as fotos (compressão automática)
- **Salvar rascunho:** A cada 30 segundos ou manualmente
- **Enviar:** Ao completar todas as seções, clique em "Enviar Inspeção"

### **4. Ver inspeções:**
- Dashboard mostra estatísticas e últimas 5 inspeções
- Clique em uma inspeção para ver detalhes completos
- Rascunhos podem ser editados

---

## 🗂️ Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── inspections/
│   │   │   └── route.ts          # GET/POST inspeções
│   │   └── upload/
│   │       └── route.ts           # Upload de imagens
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard do usuário
│   ├── inspection/
│   │   ├── [id]/
│   │   │   └── page.tsx           # Detalhes da inspeção
│   │   └── new/
│   │       └── page.tsx           # Nova inspeção
│   ├── login/
│   │   └── page.tsx               # Página de login
│   └── page.tsx                   # Redirect root
│
├── components/
│   ├── inspection/
│   │   ├── inspection-form.tsx    # Formulário principal
│   │   ├── form-sections.tsx      # Seções 3-9
│   │   └── image-upload.tsx       # Upload de imagens
│   └── ui/                        # shadcn/ui components
│
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── auth-utils.ts              # Helpers de auth
│   ├── prisma.ts                  # Prisma client
│   ├── onedrive.ts                # OneDrive service
│   ├── email.ts                   # Power Automate webhooks
│   ├── inspection-schema.ts       # Validação Zod
│   └── utils.ts                   # Utilities gerais
│
└── prisma/
    └── schema.prisma              # Schema do banco
```

---

## 🔐 Variáveis de Ambiente

Certifique-se de ter o arquivo `.env` configurado:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# OneDrive
ONEDRIVE_CLIENT_ID="..."
ONEDRIVE_CLIENT_SECRET="..."
ONEDRIVE_TENANT_ID="..."
ONEDRIVE_REFRESH_TOKEN="..."

# Power Automate
POWER_AUTOMATE_WEBHOOK_URL="..."

# Admin
ADMIN_EMAIL="leonardo.juvencio018@gmail.com"
```

---

## 📦 Tecnologias

- **Framework:** Next.js 15.1.3 (App Router)
- **Linguagem:** TypeScript 5.7.2
- **Database:** Neon PostgreSQL via Prisma ORM 6.1.0
- **Auth:** NextAuth.js v5 + Google OAuth
- **UI:** Tailwind CSS 3.4.17 + shadcn/ui (Radix UI)
- **Forms:** React Hook Form 7.54.2 + Zod 3.24.1
- **Images:** browser-image-compression 2.0.2 + sharp 0.33.5
- **Storage:** Microsoft Graph Client (OneDrive)
- **State:** Zustand 5.0.2 + TanStack Query 5.62.11

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Prisma
npm run db:push       # Sincronizar schema
npm run db:studio     # Abrir Prisma Studio
npm run db:generate   # Gerar Prisma Client

# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format
```

---

## 📝 Próximos Passos

1. **Implementar salvamento completo das respostas** na API `/api/inspections`
2. **Criar página de edição** em `/inspection/[id]/edit`
3. **Admin dashboard** para aprovar usuários
4. **Geração de PDF** com jspdf
5. **Service Worker** para modo offline
6. **Integração completa** com Power Automate para emails

---

## 📧 Contato

Admin: leonardo.juvencio018@gmail.com

---

## 📄 Licença

Propriedade da BRK. Todos os direitos reservados.
