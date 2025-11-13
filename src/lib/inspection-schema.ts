import { z } from 'zod';

/**
 * Schema de validação para o formulário de inspeção
 * Baseado no checklist BRK de 05.08.25
 */

// Enum para respostas Sim/Não/NA
export const ResponseEnum = z.enum(['YES', 'NO', 'NA']);

// Enum para resposta da pergunta 27 (Parecer Final)
export const ParecerEnum = z.enum(['YES', 'NO', 'PARTIAL']);

// Schema para cada seção do formulário
export const Section1Schema = z.object({
  q1_equipe_integrada: ResponseEnum,
  q2_cracha_visivel: ResponseEnum,
  q3_lider_presente: ResponseEnum,
  q4_pdst_elaborado: ResponseEnum,
  q5_pdst_passos_adequados: ResponseEnum,
  q6_riscos_condizentes: ResponseEnum,
  q7_barreiras_controle: ResponseEnum,
  q8_pdst_assinado: ResponseEnum,
  q9_lider_identificado: ResponseEnum,
  q10_reuniao_pretrab: ResponseEnum,
  q11_foto_pdst: z.array(z.string()).min(1, 'Obrigatório foto do PDST'),
});

export const Section2Schema = z.object({
  q11_pt_emitida: ResponseEnum,
  q12_emitente_treinado: ResponseEnum.or(z.literal('NA')),
  q13_foto_pt: z.array(z.string()).optional(),
});

export const Section3Schema = z.object({
  q14_usa_equipamentos: ResponseEnum,
  q14_equipamentos_lista: z.string().optional(),
  q14_1_inspecionados: ResponseEnum.optional(),
  q14_2_operador_treinado: ResponseEnum.optional(),
  q14_4_checklist_preuso: ResponseEnum.optional(),
  q14_5_combustivel_certificado: ResponseEnum.or(z.literal('NA')).optional(),
  q14_6_fds_disponivel: ResponseEnum.optional(),
  q14_7_transporte_seguro: ResponseEnum.optional(),
});

export const Section4Schema = z.object({
  q15_usa_maquinas: ResponseEnum,
  q15_maquinas_lista: z.string().optional(),
  q15_1_maquina_inspecionada: ResponseEnum.optional(),
  q15_2_operador_treinado: ResponseEnum.optional(),
  q15_3_operador_cracha: ResponseEnum.optional(),
  q15_4_checklist_maquina: ResponseEnum.optional(),
  q15_5_area_isolada: ResponseEnum.optional(),
  q15_6_acessorios_inspecionados: ResponseEnum.optional(),
  q15_7_cargas_guiadas: ResponseEnum.optional(),
  q16_cunhas_disponiveis: ResponseEnum.or(z.literal('NA')),
  q17_caminhoes_calcos: ResponseEnum.or(z.literal('NA')),
});

export const Section5Schema = z.object({
  q18_uso_epi: ResponseEnum,
  q19_epi_adequado: ResponseEnum,
  q20_bolsa_epi: ResponseEnum,
  q21_lanterna_noturna: ResponseEnum.or(z.literal('NA')),
});

export const Section6Schema = z.object({
  q22_local_sinalizado: ResponseEnum,
  q23_veiculos_barreira: ResponseEnum,
  q24_dispositivos_luminosos: ResponseEnum.or(z.literal('NA')),
});

export const Section7Schema = z.object({
  q25_escavacao_profunda: ResponseEnum,
  q25_1_escoramento: ResponseEnum.optional(),
  q25_2_escadas_acesso: ResponseEnum.optional(),
  q26_materiais_distantes: ResponseEnum,
});

export const Section8Schema = z.object({
  q27_equipe_consciente: ParecerEnum,
  q28_fortalecer_realizado: ResponseEnum,
  q28_temas: z.string().optional(),
  q29_indicacao_fortalecer: ResponseEnum,
  q29_nomes: z.string().optional(),
  q30_paralisacao: ResponseEnum,
  q31_nc_pendentes: ResponseEnum,
  q31_descricao_nc: z.string().optional(),
});

export const Section9Schema = z.object({
  fotos_gerais: z.array(z.string()).min(1, 'Necessário ao menos 1 foto geral'),
});

// Schema completo da inspeção
export const InspectionFormSchema = z.object({
  title: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string(),
    })
    .optional(),

  section1: Section1Schema,
  section2: Section2Schema,
  section3: Section3Schema,
  section4: Section4Schema,
  section5: Section5Schema,
  section6: Section6Schema,
  section7: Section7Schema,
  section8: Section8Schema,
  section9: Section9Schema,
});

export type InspectionFormData = z.infer<typeof InspectionFormSchema>;
export type ResponseType = z.infer<typeof ResponseEnum>;
export type ParecerType = z.infer<typeof ParecerEnum>;

export const InspectionFormDraftSchema = InspectionFormSchema.partial().extend({
  section1: Section1Schema.partial().optional(),
  section2: Section2Schema.partial().optional(),
  section3: Section3Schema.partial().optional(),
  section4: Section4Schema.partial().optional(),
  section5: Section5Schema.partial().optional(),
  section6: Section6Schema.partial().optional(),
  section7: Section7Schema.partial().optional(),
  section8: Section8Schema.partial().optional(),
  section9: Section9Schema.partial().optional(),
});
export type InspectionFormDraft = z.infer<typeof InspectionFormDraftSchema>;

// Helper para validar resposta obrigatória
export const isResponseRequired = (
  questionNumber: string,
  conditionalValue?: string
): boolean => {
  // Perguntas condicionais
  const conditionalQuestions: Record<string, string> = {
    '14.1': 'q14_usa_equipamentos',
    '14.2': 'q14_usa_equipamentos',
    '14.4': 'q14_usa_equipamentos',
    '14.5': 'q14_usa_equipamentos',
    '14.6': 'q14_usa_equipamentos',
    '14.7': 'q14_usa_equipamentos',
    '15.1': 'q15_usa_maquinas',
    '15.2': 'q15_usa_maquinas',
    '15.3': 'q15_usa_maquinas',
    '15.4': 'q15_usa_maquinas',
    '15.5': 'q15_usa_maquinas',
    '15.6': 'q15_usa_maquinas',
    '15.7': 'q15_usa_maquinas',
    '25.1': 'q25_escavacao_profunda',
    '25.2': 'q25_escavacao_profunda',
  };

  // Se é uma pergunta condicional e o valor condicional é NO, não é obrigatório
  if (conditionalQuestions[questionNumber] && conditionalValue === 'NO') {
    return false;
  }

  return true;
};

// Labels das questões (para exibição)
export const QUESTION_LABELS = {
  // Seção 1
  q1_equipe_integrada: 'A equipe presente na frente de serviço foi integrada?',
  q2_cracha_visivel:
    'Todos os funcionários possuem crachá visível com nome e foto?',
  q3_lider_presente: 'O líder da equipe está presente na frente de serviço?',
  q4_pdst_elaborado:
    'O PDST foi elaborado no local da atividade com a participação de todos?',
  q5_pdst_passos_adequados:
    'O PDST possui número adequado de passos cobrindo toda as atividades?',
  q6_riscos_condizentes:
    'Os Riscos ALTOS e MÉDIOS identificados estão condizentes com os passos?',
  q7_barreiras_controle:
    'Para riscos altos, há barreiras de controle listadas (Exceto para deslocamento)?',
  q8_pdst_assinado: 'O formulário do PDST está datado e assinado pela equipe?',
  q9_lider_identificado: 'O líder da equipe está identificado no PDST?',
  q10_reuniao_pretrab:
    'A Reunião de Pré-Trabalho foi conduzida com linguagem clara e envolvimento da equipe?',

  // Seção 2
  q11_pt_emitida:
    'Foi emitida PT antes do início da atividade para as atividades críticas?',
  q12_emitente_treinado:
    'O emitente está treinado e com cadastro válido? (2 anos BRK / 1 ano terceiros)',

  // Seção 3
  q14_usa_equipamentos:
    'A equipe utiliza equipamentos manuais (serra cliper; policorte; compactador)?',
  q14_1_inspecionados:
    'Os equipamentos foram inspecionados e liberadas pela área de Segurança do Trabalho?',
  q14_2_operador_treinado:
    'O operador do equipamento possui treinamento específico e dentro do prazo de validade?',
  q14_4_checklist_preuso: 'Foi aplicado checklist de pré-uso do equipamento?',
  q14_5_combustivel_certificado:
    'O combustível utilizado é transportado em containers certificados pelo INMETRO?',
  q14_6_fds_disponivel:
    'A Ficha de Dados de Segurança (FDS) do produto químico está disponível na frente de serviço?',
  q14_7_transporte_seguro:
    'Os equipamentos são transportados em local seguro e bem amarrado, sem risco de queda?',

  // Seção 4
  q15_usa_maquinas:
    'A equipe utiliza máquinas para movimentação de materiais (retroescavadeira; munck)?',
  q15_1_maquina_inspecionada:
    'A máquina foi inspecionada e liberada pela área de Segurança do Trabalho?',
  q15_2_operador_treinado:
    'O operador de máquina possui treinamento específico e dentro do prazo de validade?',
  q15_3_operador_cracha:
    'O operador de máquina possui crachá de identificação constando a data de validade do ASO válido?',
  q15_4_checklist_maquina: 'Foi aplicado checklist de pré-uso da máquina?',
  q15_5_area_isolada:
    'A área de movimentação de carga está isolada e livre do acesso de pessoas?',
  q15_6_acessorios_inspecionados:
    'Acessórios de içamento foram inspecionados (FR.049)?',
  q15_7_cargas_guiadas:
    'Cargas estão sendo guiadas com cordas/cabos (sem uso das mãos)?',
  q16_cunhas_disponiveis:
    'Cunhas separadoras disponíveis para materiais com risco de prensamento?',
  q17_caminhoes_calcos: 'Caminhões/veículos pesados possuem 4 calços em uso?',

  // Seção 5
  q18_uso_epi:
    'Funcionário faz uso de todos os EPI, conforme risco da atividade?',
  q19_epi_adequado:
    'EPIs adequados ao risco, em bom estado de conservação?',
  q20_bolsa_epi:
    'O funcionário possui bolsa ou local adequado para transporte de EPI?',
  q21_lanterna_noturna:
    'Funcionário possui lanterna de cabeça para atividades noturnas?',

  // Seção 6
  q22_local_sinalizado:
    'O local está bem sinalizado com Placas, cones, fitas zebradas etc., conforme PR.004.COR.TCR?',
  q23_veiculos_barreira: 'Veículos barreira posicionados corretamente?',
  q24_dispositivos_luminosos:
    'Para atividades noturnas: dispositivos luminosos instalados?',

  // Seção 7
  q25_escavacao_profunda: 'A escavação >1,25m de profundidade?',
  q25_1_escoramento: 'Escoramento ou rampa de 45°?',
  q25_2_escadas_acesso: 'Escadas ou rampas de acesso?',
  q26_materiais_distantes: 'Materiais distantes ≥1m das bordas?',

  // Seção 8
  q27_equipe_consciente:
    'Equipe consciente dos riscos e atendendo às diretrizes de segurança?',
  q28_fortalecer_realizado: 'Foi realizado o FORTALECER com a equipe em campo?',
  q29_indicacao_fortalecer:
    'Indicação de funcionários para participação no FORTALECER em sala?',
  q30_paralisacao: 'Houve necessidade de paralização da atividade?',
  q31_nc_pendentes: 'Ficou não conformidades pendentes de correção?',
} as const;
