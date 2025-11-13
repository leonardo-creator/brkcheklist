# ✏️ Funcionalidade de Edição de Inspeções

**Data:** 12 de novembro de 2025  
**Status:** ✅ IMPLEMENTADO

---

## 📋 Visão Geral

Sistema completo para edição de inspeções em rascunho (DRAFT). Permite aos usuários modificarem inspeções criadas antes de enviá-las definitivamente.

---

## 🎯 Funcionalidades Implementadas

### 1. **Página de Edição**
- **Rota:** `/inspection/[id]/edit`
- **Arquivo:** `src/app/inspection/[id]/edit/page.tsx`
- **Restrições:**
  - Apenas usuários aprovados (USER ou ADMIN)
  - Apenas o dono da inspeção pode editar
  - Apenas inspeções com status DRAFT

### 2. **Mapeamento Reverso de Dados**
- **Arquivo:** `src/lib/response-mapper.ts`
- **Função:** `mapResponsesToFormData()`
- **Processo:**
  ```
  Banco de Dados (responses + images)
          ↓
  mapResponsesToFormData()
          ↓
  Formato do Formulário (section1, section2, ...)
          ↓
  InspectionForm (preenchido)
  ```

### 3. **API de Atualização**
- **Endpoint:** `PUT /api/inspections/[id]`
- **Arquivo:** `src/app/api/inspections/[id]/route.ts`
- **Processo:**
  1. Valida autenticação e permissões
  2. Verifica se é DRAFT
  3. Deleta respostas e imagens antigas
  4. Insere novas respostas e imagens
  5. Cria log de auditoria
  6. Retorna inspeção atualizada

### 4. **Componente de Formulário Atualizado**
- **Arquivo:** `src/components/inspection/inspection-form.tsx`
- **Modificações:**
  - Aceita prop `mode: 'create' | 'edit'`
  - Usa PUT em vez de POST no modo edição
  - Mensagens customizadas por modo

---

## 🔄 Fluxo de Edição

```
1. Usuário acessa /inspection/123 (página de detalhes)
   ↓
2. Clica no botão "Editar" (apenas se status === DRAFT)
   ↓
3. Redireciona para /inspection/123/edit
   ↓
4. Servidor busca inspeção + responses + images no banco
   ↓
5. mapResponsesToFormData() converte para formato do formulário
   ↓
6. InspectionForm renderiza com initialData preenchido
   ↓
7. Usuário modifica campos desejados
   ↓
8. Clica "Enviar Inspeção" (ou "Salvar Rascunho")
   ↓
9. Frontend envia PUT /api/inspections/123
   ↓
10. Backend valida e atualiza em transação:
    - UPDATE inspection
    - DELETE old responses
    - INSERT new responses
    - DELETE old images
    - INSERT new images
    - INSERT audit log
   ↓
11. Retorna inspeção atualizada
   ↓
12. Redireciona para /inspection/123 (detalhes)
```

---

## 🧩 Estrutura de Arquivos

```
src/
├── app/
│   ├── inspection/
│   │   └── [id]/
│   │       ├── page.tsx              # Detalhes (com botão "Editar")
│   │       └── edit/
│   │           └── page.tsx          # Página de edição ✨ NOVO
│   └── api/
│       └── inspections/
│           ├── route.ts              # GET, POST (criar)
│           └── [id]/
│               └── route.ts          # PUT (atualizar) ✨ NOVO
├── components/
│   └── inspection/
│       └── inspection-form.tsx       # Aceita mode + initialData ✨ MODIFICADO
└── lib/
    └── response-mapper.ts            # Mapeamento reverso ✨ NOVO
```

---

## 🔐 Controle de Acesso

### Verificações de Segurança:

1. **Autenticação:**
   ```typescript
   const session = await requireApprovedUser();
   // Garante que usuário está logado e aprovado
   ```

2. **Propriedade:**
   ```typescript
   if (inspection.userId !== session.user.id) {
     redirect('/dashboard'); // Apenas dono pode editar
   }
   ```

3. **Status:**
   ```typescript
   if (inspection.status !== 'DRAFT') {
     redirect(`/inspection/${params.id}`); // Apenas DRAFT editável
   }
   ```

---

## 🔍 Mapeamento de Dados

### De Banco → Formulário:

```typescript
// Banco de dados
{
  responses: [
    { 
      sectionNumber: 1,
      questionNumber: 1,
      questionText: "A equipe foi integrada?",
      response: "YES",
      textValue: null
    },
    {
      sectionNumber: 1,
      questionNumber: 3,
      questionText: "Observações sobre DDS",
      response: "NA",
      textValue: "Falta treinamento de NR-10"
    }
  ],
  images: [
    {
      type: "PDST_FRONT",
      url: "https://onedrive.com/...",
      sectionNumber: 1
    }
  ]
}

// ↓ mapResponsesToFormData() ↓

// Formulário
{
  section1: {
    q1_equipe_integrada: "YES",
    q3_observacao: "Falta treinamento de NR-10",
    q11_foto_pdst: ["https://onedrive.com/..."]
  }
}
```

### Lógica de Mapeamento:

1. **Agrupa respostas por seção:**
   ```typescript
   const responsesBySection = {
     1: [resp1, resp2, resp3],
     2: [resp4, resp5],
     // ...
   };
   ```

2. **Detecta tipo de campo pelo questionText:**
   ```typescript
   if (questionText.includes('observa')) {
     return 'q3_observacao';
   }
   if (questionText.includes('Quais equipamentos')) {
     return 'q14_equipamentos_lista';
   }
   ```

3. **Classifica imagens por tipo:**
   ```typescript
   const imagesByType = {
     PDST_FRONT: ["url1", "url2"],
     PT_FRONT: ["url3"],
     GENERAL: ["url4", "url5", "url6"]
   };
   ```

4. **Reconstrói estrutura do formulário:**
   ```typescript
   formData.section1.q1_equipe_integrada = response.response; // "YES"
   formData.section1.q3_observacao = response.textValue; // texto livre
   formData.section1.q11_foto_pdst = imagesByType.PDST_FRONT; // URLs
   ```

---

## 🗄️ Operação de Atualização (PUT)

### Transação Atômica:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Atualizar metadados
  await tx.inspection.update({
    where: { id },
    data: {
      status: 'SUBMITTED', // ou continua 'DRAFT'
      title: newTitle,
      latitude: newLat,
      // ...
    }
  });

  // 2. Limpar respostas antigas
  await tx.inspectionResponse.deleteMany({
    where: { inspectionId: id }
  });

  // 3. Inserir novas respostas
  await tx.inspectionResponse.createMany({
    data: responsesData // 40-50 registros
  });

  // 4. Limpar imagens antigas
  await tx.inspectionImage.deleteMany({
    where: { inspectionId: id }
  });

  // 5. Inserir novas imagens
  await tx.inspectionImage.createMany({
    data: imageUrls // 4-6 registros
  });

  // 6. Log de auditoria
  await tx.inspectionLog.create({
    data: {
      action: 'UPDATED', // ou 'EDITED_AFTER_SUBMIT'
      description: `Rascunho atualizado com ${responsesData.length} respostas`,
      // ...
    }
  });
});
```

**Por que deletar e recriar?**
- Simplifica lógica (não precisa fazer diff)
- Garante consistência total
- Evita respostas órfãs
- Performance aceitável para ~50 registros

---

## 🎨 UI/UX

### Botão "Editar" (página de detalhes):

```tsx
{inspection.status === 'DRAFT' && (
  <Link href={`/inspection/${inspection.id}/edit`}>
    <Button variant="outline">Editar</Button>
  </Link>
)}
```

**Regra:** Botão só aparece se `status === 'DRAFT'`

### Header da Página de Edição:

```tsx
<div className="mb-6 flex items-center justify-between">
  <Link href={`/inspection/${inspection.id}`}>
    <Button variant="outline" size="sm">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Voltar
    </Button>
  </Link>

  <div className="text-sm text-gray-500">
    Editando Inspeção #0001
  </div>
</div>
```

### Título do Formulário:

```tsx
<CardTitle className="text-2xl">
  {mode === 'create' ? 'Nova Inspeção' : 'Editar Inspeção'}
</CardTitle>
```

### Mensagens de Sucesso:

```typescript
alert(
  mode === 'edit' 
    ? 'Inspeção atualizada com sucesso!' 
    : 'Inspeção enviada com sucesso!'
);
```

---

## 📊 Auditoria de Edições

### Tipos de Log:

1. **UPDATED** - Edição de rascunho (ainda DRAFT)
2. **EDITED_AFTER_SUBMIT** - Rascunho editado e enviado (DRAFT → SUBMITTED)

### Registro de Log:

```typescript
{
  action: 'UPDATED',
  description: 'Rascunho atualizado com 43 respostas e 5 imagens',
  userId: 'user_123',
  userEmail: 'user@example.com',
  userName: 'João Silva',
  newValue: JSON.stringify({
    status: 'DRAFT',
    responsesCount: 43,
    imagesCount: 5
  }),
  createdAt: '2025-11-12T00:00:00.000Z'
}
```

**Histórico completo:** Cada edição cria um novo log, preservando o histórico.

---

## 🧪 Como Testar

### Teste Completo de Edição:

1. **Criar inspeção em rascunho:**
   ```
   1. Acesse /inspection/new
   2. Preencha algumas seções (não todas)
   3. Clique "Salvar Rascunho"
   4. Anote o ID da inspeção (ex: clx123...)
   ```

2. **Editar a inspeção:**
   ```
   1. Acesse /inspection/clx123
   2. Verifique que botão "Editar" aparece
   3. Clique em "Editar"
   4. URL deve ser /inspection/clx123/edit
   5. Formulário deve estar preenchido com dados salvos
   ```

3. **Modificar dados:**
   ```
   1. Mude resposta de SIM para NÃO em uma questão
   2. Adicione texto em um campo condicional
   3. Faça upload de nova foto
   4. Mude o título
   ```

4. **Salvar mudanças:**
   ```
   1. Clique "Enviar Inspeção" (ou "Salvar Rascunho")
   2. Aguarde mensagem de sucesso
   3. Deve redirecionar para /inspection/clx123
   4. Verifique que mudanças estão refletidas
   ```

5. **Verificar no banco:**
   ```bash
   npx prisma studio
   # http://localhost:5555
   
   # Tabela inspections:
   # - Deve ter updatedAt > createdAt
   # - Status pode ser SUBMITTED se enviou
   
   # Tabela inspection_responses:
   # - Deve ter as novas respostas (não as antigas)
   
   # Tabela inspection_logs:
   # - Deve ter 2 logs: CREATED + UPDATED
   ```

### Teste de Restrições:

**Testar que não edita se não for DRAFT:**
```
1. Crie e envie inspeção (status = SUBMITTED)
2. Tente acessar /inspection/[id]/edit
3. Deve redirecionar para /inspection/[id]
4. Botão "Editar" não deve aparecer
```

**Testar que não edita inspeção de outro usuário:**
```
1. Faça login com usuário A
2. Crie inspeção em rascunho
3. Faça logout
4. Faça login com usuário B
5. Tente acessar /inspection/[id]/edit
6. Deve redirecionar para /dashboard
```

---

## ✅ Checklist de Funcionalidades

- [x] Página de edição criada (`/inspection/[id]/edit`)
- [x] Função de mapeamento reverso (`mapResponsesToFormData`)
- [x] API PUT endpoint (`/api/inspections/[id]`)
- [x] Componente InspectionForm aceita `mode` e `initialData`
- [x] Botão "Editar" na página de detalhes
- [x] Verificação de propriedade (apenas dono edita)
- [x] Verificação de status (apenas DRAFT editável)
- [x] Transação atômica na atualização
- [x] Logs de auditoria para edições
- [x] Mensagens customizadas por modo
- [x] Redirecionamento após salvar

---

## 🐛 Problemas Conhecidos

### Linting Warnings (não críticos):

1. **Cognitive Complexity** - `mapFormDataToResponses()` e `mapResponsesToFormData()`
   - **Status:** Aceito (funções grandes por natureza)
   - **Motivo:** 9 seções com lógica específica cada

2. **TODO Comments** - `response-mapper.ts`
   - **Linha 234:** "Idealmente isto deveria vir do QUESTION_LABELS invertido"
   - **Status:** Melhoria futura
   - **Motivo:** Mapeamento manual funciona por enquanto

### Limitações Conhecidas:

1. **Sem edição incremental:**
   - Deleta e recria todas as respostas/imagens
   - **Impacto:** Performance OK para ~50 registros
   - **Melhoria futura:** Implementar diff para grandes volumes

2. **Sem versionamento:**
   - Apenas último estado é mantido
   - **Impacto:** Não há "desfazer" no banco
   - **Workaround:** Logs preservam histórico

---

## 📈 Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos criados | 2 |
| Arquivos modificados | 2 |
| Linhas adicionadas | ~450 |
| Endpoints novos | 1 (PUT) |
| Funções novas | 3 |
| Tempo de desenvolvimento | ~2 horas |

---

## 🚀 Próximos Passos

1. **Melhorar mapeamento:**
   - Inverter QUESTION_LABELS automaticamente
   - Reduzir cognitive complexity

2. **Adicionar diff:**
   - Comparar dados antigos vs novos
   - Atualizar apenas campos modificados
   - Registrar mudanças específicas no log

3. **Versionamento:**
   - Criar tabela `inspection_versions`
   - Salvar snapshot antes de cada edição
   - Implementar "Restaurar versão anterior"

4. **UI melhorias:**
   - Indicador de "Editado em [data]"
   - Histórico de edições na página de detalhes
   - Comparação lado a lado (versão antiga vs nova)

---

**Status Final:** ✅ **FUNCIONAL E PRONTO PARA USO**

O sistema de edição está completo e permite aos usuários modificarem inspeções em rascunho com segurança, auditoria completa e validação de permissões.
