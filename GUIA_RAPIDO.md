# 🚀 Guia Rápido - BRK Checklist

## 📌 Início Rápido (5 minutos)

### 1️⃣ **Primeiro Acesso**

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:generate
npm run db:push

# Iniciar servidor
npm run dev
```

Acesse: **http://localhost:3000**

---

## 👤 Fluxos de Uso

### **USUÁRIO COMUM (Inspetor)**

#### ✅ Fazer Login
1. Clique em "Entrar com Google"
2. Aguarde aprovação do admin
3. Após aprovação, acesse o Dashboard

#### ✅ Criar Nova Inspeção
1. Dashboard → "Nova Inspeção"
2. Preencha as 9 seções:
   - Planejamento e Integração
   - Permissão de Trabalho
   - Máquinas e Equipamentos
   - Movimentação de Cargas
   - EPIs
   - Sinalização
   - Escavações
   - Parecer Final
   - Registro Fotográfico

3. **Upload de Fotos:**
   - Tire foto direto do celular OU
   - Faça upload de arquivo
   - Compressão automática

4. **Salvar Rascunho:**
   - Botão "Salvar Rascunho"
   - Continue depois

5. **Finalizar:**
   - Botão "Enviar Inspeção"
   - PDF gerado automaticamente
   - Email enviado com relatório

#### ✅ Histórico de Inspeções
- Ver todas inspeções criadas
- Filtrar por data, status, local
- Editar inspeções (gera log automático)
- Download de PDF

#### ✅ Modo Offline
- Preencha formulários sem internet
- Sincronização automática quando online
- Indicador de status de sync

---

### **ADMINISTRADOR**

#### ✅ Aprovar Usuários
1. Dashboard Admin → "Usuários Pendentes"
2. Ver lista de solicitações
3. Aprovar OU Rejeitar
4. Usuário recebe notificação

#### ✅ Gerenciar Permissões
1. Lista de todos usuários
2. Alterar role: USER → ADMIN
3. Remover usuários

#### ✅ Visualizar Todas Inspeções
- Acesso total a todas inspeções
- Filtros avançados
- Exportação para Excel/CSV
- Estatísticas detalhadas

#### ✅ Logs de Auditoria
- Ver histórico completo de cada inspeção
- Quem editou, quando, o que mudou
- IP, user agent, timestamp
- Recebe email quando há edição pós-envio

#### ✅ Dashboard Analítico
- Gráficos de conformidade
- Trends mensais
- Top não-conformidades
- Performance por usuário

---

## 📋 Estrutura do Checklist

### **Seção 1: Planejamento e Integração (10 perguntas)**
- Integração da equipe
- Crachás visíveis
- Líder presente
- PDST elaborado
- etc.

### **Seção 2: Permissão de Trabalho (3 perguntas)**
- PT emitida
- Emitente treinado
- Foto da PT

### **Seção 3: Máquinas e Equipamentos (7 perguntas)**
- Equipamentos inspecionados
- Operador treinado
- Checklist de pré-uso
- etc.

### **Seção 4: Movimentação de Cargas (8 perguntas)**
- Máquina inspecionada
- Área isolada
- Acessórios verificados
- etc.

### **Seção 5: EPIs (4 perguntas)**
- Uso correto
- Estado de conservação
- Bolsa de transporte
- Lanterna (noturno)

### **Seção 6: Sinalização (3 perguntas)**
- Placas e cones
- Veículos barreira
- Dispositivos luminosos

### **Seção 7: Escavações (4 perguntas)**
- Profundidade > 1,25m
- Escoramento
- Escadas de acesso
- Materiais distantes

### **Seção 8: Parecer Final (5 perguntas)**
- Conscientização da equipe
- FORTALECER realizado
- Paralização necessária?
- Não conformidades pendentes

### **Seção 9: Registro Fotográfico**
- Upload ilimitado de fotos
- Organização automática no OneDrive

---

## 🔧 Casos de Uso Avançados

### **Editar Inspeção Após Envio**
1. Abra a inspeção enviada
2. Clique em "Editar"
3. Faça as alterações necessárias
4. Salvar → **Admin recebe notificação automática**
5. Log detalhado é criado com:
   - Campos alterados
   - Valores antigos vs novos
   - Timestamp
   - Usuário

### **Trabalhar Offline**
1. Abra o app no celular/tablet
2. Sem internet? Sem problema!
3. Crie inspeções normalmente
4. Tire fotos (salvas localmente)
5. Quando internet retornar:
   - Sincronização automática
   - Upload de fotos
   - Envio de emails

### **Exportar Dados**
1. Dashboard Admin → "Exportar"
2. Selecione período
3. Escolha formato (Excel/CSV)
4. Download instantâneo

### **Gerar Relatório PDF**
- Automático ao finalizar inspeção
- Contém:
  - Todas respostas
  - Fotos organizadas
  - Metadados (GPS, data/hora)
  - Assinatura digital (opcional)

---

## 🎨 Atalhos e Dicas

### **Atalhos de Teclado**
- `Ctrl+S` - Salvar rascunho
- `Ctrl+Enter` - Enviar inspeção (se completa)
- `Esc` - Fechar modal

### **Dicas de Produtividade**
- ✅ Tire fotos ANTES de responder perguntas
- ✅ Use geolocalização para registrar local exato
- ✅ Salve rascunhos frequentemente
- ✅ Revise antes de enviar (não pode ser desfeito)

### **Boas Práticas**
- 📸 Mínimo 5 fotos por inspeção
- 📝 Preencha campos de texto livres com detalhes
- 🔍 Revise não-conformidades antes de enviar
- 📧 Confira o email após envio

---

## 🆘 Troubleshooting

### **Erro ao fazer login**
- Verifique se está usando email correto
- Limpe cache do navegador
- Tente modo anônimo

### **Upload de foto falhou**
- Verifique tamanho (máx 10MB)
- Formato suportado: JPG, PNG, WEBP
- Internet estável?

### **Sincronização offline travada**
- Menu → Configurações → "Forçar Sync"
- Recarregue a página
- Contate o admin

### **Email não chegou**
- Verifique spam/lixeira
- Aguarde 5 minutos
- Dashboard → Reenviar Email

---

## 📱 Mobile vs Desktop

### **Mobile (Recomendado para campo)**
- ✅ Tirar fotos direto
- ✅ GPS automático
- ✅ Modo offline
- ✅ Notificações push

### **Desktop (Melhor para relatórios)**
- ✅ Dashboard completo
- ✅ Exportação de dados
- ✅ Gerenciamento de usuários
- ✅ Análise de estatísticas

---

## 🔐 Segurança

### **Dados Protegidos**
- ✅ Login seguro via Google OAuth
- ✅ Criptografia SSL/TLS
- ✅ Auditoria completa de logs
- ✅ Backups automáticos no Neon

### **Privacidade**
- ✅ Fotos armazenadas apenas no OneDrive
- ✅ Links privados (somente leitura)
- ✅ Dados pessoais protegidos (LGPD)

---

## 📞 Suporte

**Admin Principal:** leonardo.juvencio018@gmail.com

**FAQ:**
- Como alterar minha senha? → Gerenciado pelo Google
- Perdi acesso? → Contate o admin
- Bug encontrado? → Email com print

---

**Última atualização:** 12/11/2025
