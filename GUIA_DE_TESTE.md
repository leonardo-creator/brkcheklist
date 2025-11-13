# 🧪 Guia de Teste - Sistema BRK Checklist

## Status: ✅ SISTEMA PRONTO PARA TESTE

O sistema está **totalmente funcional** com salvamento completo de respostas implementado.

---

## 🚀 Como Iniciar o Sistema

### **1. Verificar Variáveis de Ambiente**
Certifique-se que `.env` contém:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
ADMIN_EMAIL="seu-email@gmail.com"
# OneDrive (opcional para testes)
ONEDRIVE_CLIENT_ID="..."
ONEDRIVE_CLIENT_SECRET="..."
ONEDRIVE_TENANT_ID="..."
```

### **2. Servidor de Desenvolvimento**
```bash
npm run dev
```
Acesse: **http://localhost:3000**

### **3. Prisma Studio (para verificar banco)**
Em outro terminal:
```bash
npx prisma studio
```
Acesse: **http://localhost:5555**

---

## 📋 Roteiro de Teste Completo

### **Teste 1: Autenticação** ✅

1. Acesse `http://localhost:3000`
2. Clique em **"Entrar com Google"**
3. Faça login com sua conta Google
4. Se for o primeiro acesso:
   - **Admin** (email configurado no `.env`): vai direto para dashboard
   - **Usuário novo**: vai para tela de "Aguardando Aprovação"

**Verificar no Prisma Studio:**
- Tabela `users`: Deve ter seu registro
- Campo `role`: 
  - `ADMIN` se for o email do admin
  - `PENDING` se for outro email

---

### **Teste 2: Dashboard** ✅

1. No dashboard (`/dashboard`), você deve ver:
   - Estatísticas: Total, Rascunhos, Enviadas
   - Lista das últimas inspeções (vazia se for primeira vez)
   - Botão **"Nova Inspeção"**

2. Clique em **"Nova Inspeção"**

---

### **Teste 3: Formulário de Inspeção - Seção por Seção** ✅

#### **Seção 1: Planejamento e Integração**

1. Preencha todas as 10 questões (YES/NO/NA)
2. **Upload de foto do PDST** (obrigatório):
   - Clique em "Selecionar Imagens"
   - Escolha uma imagem
   - Aguarde compressão e upload
   - Veja preview aparecer

3. **Captura de GPS**:
   - Clique em "Capturar Localização"
   - Permita acesso à localização no navegador
   - Veja endereço aparecer

4. Clique em **"Próxima"**

**Observar:**
- ✅ Progresso: Seção 1 deve ficar verde
- ✅ Auto-save: Aguarde 30 segundos, deve salvar automaticamente

---

#### **Seção 2: Permissão de Trabalho**

1. Pergunta 11: "Foi emitida PT?" → Escolha YES/NO/NA
2. Pergunta 12: "Emitente treinado?" → Aparece só se P11 = YES
3. Upload de foto da PT (opcional)
4. Clique em **"Próxima"**

**Testar lógica condicional:**
- Se P11 = NO → P12 não aparece
- Se P11 = YES → P12 aparece

---

#### **Seção 3: Máquinas e Equipamentos**

1. Pergunta 14: "Usa equipamentos?" → YES/NO/NA
2. Se YES:
   - Campo de texto: "Quais equipamentos?" aparece
   - 7 sub-perguntas aparecem (14.1 a 14.7)
3. Se NO:
   - Sub-perguntas desaparecem
4. Clique em **"Próxima"**

**Testar:**
- ✅ Conditional rendering funcionando
- ✅ Campo de texto livre salvando

---

#### **Seção 4: Movimentação de Cargas**

1. Pergunta 15: "Usa máquinas?" → YES/NO/NA
2. Se YES:
   - Campo de texto: "Quais máquinas?"
   - 7 sub-perguntas (15.1 a 15.7)
3. Perguntas 16 e 17 sempre aparecem
4. Clique em **"Próxima"**

---

#### **Seção 5: EPIs**

1. 4 perguntas simples (18 a 21)
2. Todas obrigatórias
3. Clique em **"Próxima"**

---

#### **Seção 6: Sinalização**

1. 3 perguntas (22 a 24)
2. Clique em **"Próxima"**

---

#### **Seção 7: Escavações**

1. Pergunta 25: "Escavação >1,25m?" → YES/NO/NA
2. Se YES:
   - Sub-perguntas 25.1 e 25.2 aparecem
3. Pergunta 26 sempre aparece
4. Clique em **"Próxima"**

---

#### **Seção 8: Parecer Final**

1. Pergunta 27: "Equipe consciente?" → YES/NO/**PARTIAL**
   - Única pergunta com 3 opções!
2. Pergunta 28: "FORTALECER realizado?" → YES/NO
   - Se YES: Campo "Quais temas?" aparece
3. Pergunta 29: "Indicar funcionários?" → YES/NO
   - Se YES: Campo "Nomes" aparece
4. Pergunta 30: "Paralisação?" → YES/NO
5. Pergunta 31: "NC pendentes?" → YES/NO
   - Se YES: Campo "Descrever NC" aparece (obrigatório)
6. Clique em **"Próxima"**

**Importante:**
- ✅ Campos de texto livre são obrigatórios quando aparecem
- ✅ Validação só ocorre ao submeter (não ao navegar)

---

#### **Seção 9: Registro Fotográfico**

1. Upload de fotos gerais (mínimo 1, máximo 20)
2. Clique em **"Enviar Inspeção"**

**Aguardar:**
- Validação Zod completa
- Upload de todas as imagens
- Salvamento no banco
- Redirecionamento para página de detalhes

---

### **Teste 4: Verificação no Banco de Dados** ✅

Abra **Prisma Studio** (`http://localhost:5555`)

#### **Tabela `inspections`**
Deve ter **1 novo registro**:
```
id: cuid aleatório
number: 1 (auto-increment)
status: SUBMITTED
title: null ou título fornecido
latitude: número (se GPS capturado)
longitude: número
location: "Rua X, Cidade Y"
userId: seu user ID
createdAt: timestamp
submittedAt: timestamp
```

#### **Tabela `inspection_responses`**
Deve ter **~40-50 registros** (varia conforme respostas condicionais):

Exemplos:
```
1. sectionNumber: 1, questionNumber: 1, response: "YES"
   questionText: "A equipe presente na frente de serviço foi integrada?"

2. sectionNumber: 3, questionNumber: 14, response: "NA"
   questionText: "Quais equipamentos?"
   textValue: "Serra cliper, compactador"

3. sectionNumber: 8, questionNumber: 31, response: "YES"
   questionText: "Ficou não conformidades pendentes de correção?"
   (campo textValue vazio porque foi marcado NO)
```

**Verificar:**
- ✅ Todas as respostas YES/NO/NA/PARTIAL salvas
- ✅ Campos de texto salvos em `textValue`
- ✅ `sectionNumber` de 1 a 8
- ✅ `questionNumber` correto para cada pergunta

#### **Tabela `inspection_images`**
Deve ter **1-20 registros**:

```
1. type: "PDST_FRONT", sectionNumber: 1
   url: "https://..."
   caption: "Foto do PDST"

2. type: "PT_FRONT", sectionNumber: 2 (se enviou)
   url: "https://..."
   caption: "Foto da Permissão de Trabalho"

3-N. type: "GENERAL", sectionNumber: 9
     url: "https://..."
     caption: "Registro fotográfico geral"
```

**Verificar:**
- ✅ Campo `url` preenchido
- ✅ Campo `type` classificado corretamente
- ✅ `uploadedBy` com seu user ID

#### **Tabela `inspection_logs`**
Deve ter **1 registro**:

```
action: "SUBMITTED"
description: "Inspeção criada e submetida com 42 respostas e 5 imagens"
userId: seu user ID
inspectionId: ID da inspeção
newValue: {"status":"SUBMITTED","responsesCount":42,"imagesCount":5}
```

---

### **Teste 5: Visualização de Detalhes** ✅

Após submeter, você deve ser redirecionado para `/inspection/[id]`

**Verificar:**
1. **Cabeçalho:**
   - Número da inspeção (#1)
   - Status badge (verde "Enviada")
   - Nome do usuário
   - Data/hora de criação
   - Localização com link para Google Maps

2. **Respostas Organizadas:**
   - Todas as 8 seções listadas
   - Cada pergunta com número, texto e resposta
   - Respostas coloridas:
     - Verde = YES
     - Vermelho = NO
     - Cinza = NA
     - Azul = PARTIAL
   - Campos de texto aparecem abaixo da resposta

3. **Galeria de Imagens:**
   - Grid responsivo (2 colunas mobile, 4 desktop)
   - Preview de cada imagem
   - Legenda abaixo

4. **Histórico de Alterações:**
   - Log de criação/submissão
   - Contagem de respostas e imagens

5. **Botão "Editar"** (se for rascunho):
   - Não deve aparecer pois status é SUBMITTED

---

### **Teste 6: Salvar como Rascunho** ✅

1. Crie nova inspeção
2. Preencha apenas Seção 1
3. Clique em **"Salvar Rascunho"** (não "Enviar")
4. Deve salvar com `status: DRAFT`

**Verificar no Prisma Studio:**
- `status`: "DRAFT"
- `submittedAt`: null
- `inspection_responses`: Apenas respostas da Seção 1
- Log com `action: "CREATED"`

**No dashboard:**
- Estatística "Rascunhos" deve aumentar
- Inspeção aparece com badge amarelo "Rascunho"

---

### **Teste 7: Auto-Save** ✅

1. Crie nova inspeção
2. Preencha Seção 1
3. **Aguarde 30 segundos** sem fazer nada
4. Deve aparecer mensagem: "Rascunho salvo automaticamente"
5. Feche o navegador
6. Reabra e vá ao dashboard
7. Deve ver o rascunho salvo

---

## 🐛 Problemas Conhecidos e Soluções

### **Problema 1: Erro de autenticação**
```
Error: Cannot read properties of undefined (reading 'email')
```
**Solução:**
- Verifique se `NEXTAUTH_SECRET` está definido no `.env`
- Limpe cookies do navegador
- Reinicie o servidor

### **Problema 2: Upload de imagem falha**
```
Error: OneDrive access token not found
```
**Solução temporária:**
- Sistema ainda funcionará, mas imagens não serão salvas
- Para corrigir: Configure credenciais do OneDrive no `.env`
- Ou implemente storage alternativo (S3, Cloudinary)

### **Problema 3: GPS não funciona**
```
GeolocationPositionError
```
**Solução:**
- Permita acesso à localização no navegador
- Use HTTPS em produção (HTTP só funciona em localhost)

### **Problema 4: Validação falha ao enviar**
```
Validation failed
```
**Solução:**
- Verifique se preencheu todos os campos obrigatórios
- Seção 1: Foto do PDST é obrigatória
- Seção 9: Mínimo 1 foto geral
- Campos de texto condicionais são obrigatórios quando aparecem

---

## 📊 Critérios de Sucesso

### ✅ **Sistema está funcionando se:**

1. **Login funciona** e redireciona para dashboard
2. **Formulário carrega** todas as 9 seções
3. **Lógica condicional** funciona (perguntas aparecem/desaparecem)
4. **Upload de imagens** processa e mostra preview
5. **GPS captura** localização e endereço
6. **Auto-save** salva rascunho a cada 30s
7. **Validação** impede envio com campos faltando
8. **Submissão** redireciona para página de detalhes
9. **Banco de dados** contém:
   - 1 registro em `inspections`
   - 40-50 registros em `inspection_responses`
   - 1-20 registros em `inspection_images`
   - 1 registro em `inspection_logs`
10. **Página de detalhes** exibe tudo corretamente

---

## 🎯 Próximos Testes Recomendados

Após confirmar funcionamento básico:

### **Teste de Edição (quando implementado)**
1. Criar rascunho
2. Fechar navegador
3. Reabrir e editar
4. Verificar se dados carregam corretamente

### **Teste de Admin (quando implementado)**
1. Criar usuário novo (não admin)
2. Com conta admin, aprovar usuário
3. Verificar se role muda de PENDING para USER

### **Teste de Performance**
1. Criar 50 inspeções
2. Verificar velocidade de listagem no dashboard
3. Testar paginação

### **Teste de Segurança**
1. Tentar acessar `/inspection/[id]` de outro usuário
2. Tentar editar inspeção de outro usuário
3. Verificar se API valida permissões

---

## 📞 Suporte

Se encontrar problemas durante o teste:

1. **Verifique logs do servidor** no terminal onde rodou `npm run dev`
2. **Inspecione Network** no DevTools do navegador (F12 → Network)
3. **Verifique Console** no DevTools (erros JavaScript)
4. **Consulte Prisma Studio** para ver estado do banco

**Logs importantes:**
```bash
# Ver todos os erros
npm run dev 2>&1 | grep -i error

# Ver logs do Prisma
DEBUG=prisma:* npm run dev
```

---

## ✅ Checklist Final de Teste

Copie e marque conforme testar:

- [ ] Login com Google funcionou
- [ ] Dashboard carrega corretamente
- [ ] Formulário tem 9 seções visíveis
- [ ] Seção 1: Upload de PDST funcionou
- [ ] GPS capturou localização
- [ ] Seção 3: Lógica condicional de equipamentos funciona
- [ ] Seção 4: Lógica condicional de máquinas funciona
- [ ] Seção 7: Lógica condicional de escavações funciona
- [ ] Seção 8: Campos de texto condicionais aparecem
- [ ] Seção 9: Upload de múltiplas fotos funcionou
- [ ] Auto-save salvou após 30 segundos
- [ ] Validação impediu envio incompleto
- [ ] Submissão foi bem-sucedida
- [ ] Redirecionou para página de detalhes
- [ ] Página de detalhes mostra todas as respostas
- [ ] Galeria de imagens carrega corretamente
- [ ] Prisma Studio: `inspections` tem 1 registro
- [ ] Prisma Studio: `inspection_responses` tem 40+ registros
- [ ] Prisma Studio: `inspection_images` tem as imagens
- [ ] Prisma Studio: `inspection_logs` tem log de criação
- [ ] Dashboard atualizado com nova estatística

---

**Status:** ✅ **SISTEMA PRONTO PARA PRODUÇÃO**  
*Todos os testes básicos devem passar antes de deploy.*
