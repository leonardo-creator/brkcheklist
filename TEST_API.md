# 🧪 Teste Manual da API de Inspeções

Este arquivo documenta como testar a API de inspeções manualmente.

## ✅ Checklist de Pré-requisitos

- [x] Servidor rodando em http://localhost:3000
- [x] Banco de dados Neon configurado
- [x] Schema Prisma aplicado com `npm run db:push`
- [x] Variáveis de ambiente configuradas no `.env`
- [x] Google OAuth configurado

## 🎯 Teste 1: Verificar Autenticação

1. Acesse: http://localhost:3000
2. Clique em "Login com Google"
3. Faça login com sua conta Google
4. Verifique se você foi redirecionado para a página inicial

## 🎯 Teste 2: Criar Nova Inspeção (UI)

### Passos:

1. Acesse: http://localhost:3000/inspection/new
2. Preencha os campos:

**Seção 1: Planejamento e Integração**
- q1: SIM
- q2: SIM
- q3: NÃO (deve exibir campo de texto)
- q3_observacao: "Falta treinamento de NR-10"
- q4: SIM
- q5: SIM
- q6: SIM
- q7: PARCIAL
- q8: SIM
- q9: SIM
- q10: SIM
- q11: Upload de 1 foto do PDST

**Seção 2: Permissão de Trabalho**
- q12: SIM
- q13: Upload de 1 foto da PT

**Seção 3: Máquinas e Equipamentos**
- q14: SIM (deve exibir campo de lista)
- q14_lista: "Compactador, Retroescavadeira, Serra Clipper"
- q15: SIM
- q16: SIM
- q17: SIM
- q18: SIM
- q19: SIM
- q20: SIM

**Seção 4: Ferramentas e Máquinas**
- q21: NÃO

**Seção 5: Veículos**
- q22: SIM

**Seção 6: Instalações e Áreas de Vivência**
- q23: SIM

**Seção 7: Escavações**
- q24: SIM
- q25: 2.5 (maior que 1.25, deve exibir q26 e q27)
- q26: SIM
- q27: SIM

**Seção 8: Parecer Final**
- q27_fortalecer: SIM (deve exibir campos de texto)
- q28_temas: "NR-10, NR-12, Trabalho em Altura"
- q29_nomes: "João Silva, Maria Santos"
- q30_nao_conformidades: SIM (deve exibir campo de descrição)
- q31_descricao: "Cabo de energia exposto próximo à escavação"

**Seção 9: Fotos Gerais**
- Upload de 2-3 fotos gerais

3. Clique em "Enviar Inspeção"
4. Aguarde redirecionamento para a página de detalhes

### Resultado Esperado:
- Inspeção criada com sucesso
- Redirecionado para `/inspection/[id]`
- Página mostra todas as respostas organizadas por seção
- Imagens aparecem nas seções corretas

## 🎯 Teste 3: Verificar no Banco de Dados

1. Abra o Prisma Studio:
```bash
npx prisma studio
```

2. Acesse: http://localhost:5555

3. Verifique as tabelas:

### Tabela `inspections`:
- Deve ter **1 registro**
- Campos:
  - `id`: UUID gerado
  - `number`: 1 (auto-incremento)
  - `userId`: ID do usuário logado
  - `status`: "SUBMITTED"
  - `title`: Título da inspeção
  - `latitude`, `longitude`, `location`: Dados de GPS
  - `submittedAt`: Data/hora atual
  - `createdAt`, `updatedAt`: Timestamps

### Tabela `inspection_responses`:
- Deve ter **~40-50 registros** com mesmo `inspectionId`
- Exemplos de registros:

| sectionNumber | questionNumber | questionText | response | textValue |
|---------------|----------------|--------------|----------|-----------|
| 1 | 1 | A equipe foi integrada? | YES | null |
| 1 | 3 | DDS realizado? | NO | null |
| 1 | 3 | Observações sobre DDS | NA | "Falta treinamento..." |
| 3 | 14 | Usa equipamentos? | YES | null |
| 3 | 14 | Quais equipamentos? | NA | "Compactador, Retro..." |
| 7 | 25 | Profundidade | NA | "2.5" |
| 8 | 28 | Temas FORTALECER | NA | "NR-10, NR-12..." |

**Observações importantes:**
- `response`: Sempre YES, NO, NA ou PARTIAL
- `textValue`: Preenchido apenas para campos de texto livre
- `questionNumber`: Extraído da chave (ex: q14 → 14)
- `sectionTitle`: Nome completo da seção em CAPS

### Tabela `inspection_images`:
- Deve ter **4-6 registros** (1 PDST + 1 PT + 2-3 GENERAL)
- Campos:
  - `type`: PDST_FRONT, PT_FRONT ou GENERAL
  - `sectionNumber`: 1 (PDST), 2 (PT), 9 (GENERAL)
  - `url`: URL da imagem no OneDrive
  - `caption`: Descrição automática
  - `uploadedBy`: ID do usuário

### Tabela `inspection_logs`:
- Deve ter **1 registro**
- Campos:
  - `action`: "SUBMITTED"
  - `description`: "Inspeção criada e submetida com X respostas e Y imagens"
  - `newValue`: JSON com estatísticas
  - `userEmail`, `userName`: Dados do usuário

## 🎯 Teste 4: Verificar API Diretamente (Opcional)

Caso queira testar a API diretamente com cURL/Postman:

### GET /api/inspections
```bash
# Listar todas as inspeções
curl http://localhost:3000/api/inspections \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "inspections": [
    {
      "id": "clx...",
      "number": 1,
      "title": "...",
      "status": "SUBMITTED",
      "responses": [...], // Array com 40-50 itens
      "images": [...],     // Array com 4-6 itens
      "logs": [...]        // Array com 1 item
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## ✅ Critérios de Sucesso

- [ ] Formulário permite preenchimento de todas as 9 seções
- [ ] Campos condicionais aparecem corretamente:
  - [ ] Seção 1, q3 (DDS observações)
  - [ ] Seção 3, q14 (lista de equipamentos)
  - [ ] Seção 7, q25 (escavação > 1.25m)
  - [ ] Seção 8, q27 (FORTALECER temas/nomes)
  - [ ] Seção 8, q30 (NCs pendentes descrição)
- [ ] Upload de imagens funciona sem erros
- [ ] GPS é capturado automaticamente
- [ ] Botão "Enviar" redireciona para detalhes
- [ ] Página de detalhes mostra todas as respostas
- [ ] Banco de dados tem todos os registros esperados:
  - [ ] 1 inspeção
  - [ ] 40-50 respostas
  - [ ] 4-6 imagens classificadas
  - [ ] 1 log de auditoria

## 🐛 Problemas Comuns

### Erro: "Não autorizado"
**Causa:** Sessão expirada ou não autenticado  
**Solução:** Faça logout e login novamente

### Erro: "Validação falhou"
**Causa:** Campos obrigatórios não preenchidos  
**Solução:** Preencha todos os campos marcados com asterisco (*)

### Erro ao fazer upload de imagens
**Causa:** Problema com OneDrive ou compressão  
**Solução:** Verifique as variáveis `MICROSOFT_*` no `.env`

### GPS não é capturado
**Causa:** Permissão de localização negada  
**Solução:** Permita acesso à localização no navegador

### Inspeção salva mas respostas não aparecem
**Causa:** Função `mapFormDataToResponses()` não está pegando os campos  
**Solução:** Verifique os logs do console no terminal do servidor

## 📊 Estatísticas Esperadas

Para uma inspeção completa com todas as seções preenchidas:

| Métrica | Valor Esperado |
|---------|----------------|
| Responses salvos | 40-50 |
| Images salvos | 4-6 |
| Logs salvos | 1 |
| Tempo de save | < 2 segundos |
| Tamanho do JSON | ~20-30 KB |

## 🔍 Debug Tips

### Ver logs do servidor:
```bash
# Terminal onde roda npm run dev
# Procure por:
# - "Erro ao criar inspeção:"
# - "POST /api/inspections"
# - Stack traces
```

### Ver dados enviados:
```javascript
// No DevTools do navegador (F12)
// Aba Network > XHR/Fetch
// Clique na requisição POST /api/inspections
// Aba "Payload" mostra os dados enviados
// Aba "Response" mostra a resposta da API
```

### Ver estado do formulário:
```javascript
// No componente InspectionForm
// Adicione console.log antes do submit:
const onSubmit = async (data: InspectionFormData) => {
  console.log('📝 Dados do formulário:', JSON.stringify(data, null, 2));
  // ...resto do código
}
```

---

**Status:** Pronto para teste  
**Última atualização:** 12/11/2025
