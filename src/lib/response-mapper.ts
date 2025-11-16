import type { InspectionFormData } from './inspection-schema';

/**
 * Converte respostas do banco de dados para o formato do formulário
 * 
 * Esta função faz o processo INVERSO de mapFormDataToResponses():
 * - Agrupa respostas por seção
 * - Reconstrói os campos do formulário (q1, q2, q3, etc)
 * - Popula campos de texto (textValue) e listas (listValues)
 * - Restaura valores de enums (YES/NO/NA/PARTIAL)
 */
export function mapResponsesToFormData(responses: Array<{
  sectionNumber: number;
  questionNumber: number;
  questionText: string;
  response: 'YES' | 'NO' | 'NA' | 'PARTIAL' | null;
  textValue?: string | null;
  listValues?: string[] | null;
}>, images: Array<{
  type: string; // Aceita qualquer ImageType
  url: string;
  sectionNumber?: number | null;
}>): Partial<InspectionFormData> {
  
  const formData: Partial<InspectionFormData> = {};

  // Log inicial de debug
  console.log('🔍 === INICIANDO MAPEAMENTO DE RESPOSTAS ===');
  console.log('🔍 Total de respostas recebidas:', responses.length);
  console.log('🔍 Total de imagens recebidas:', images.length);
  
  // Agrupar respostas por seção
  const responsesBySection = responses.reduce((acc, r) => {
    acc[r.sectionNumber] ??= [];
    acc[r.sectionNumber]!.push(r);
    return acc;
  }, {} as Record<number, typeof responses>);

  // Log de respostas agrupadas
  console.log('🔍 Respostas por seção:', Object.keys(responsesBySection).map(k => `Seção ${k}: ${responsesBySection[Number(k)]?.length} respostas`));
  
  // Agrupar imagens por tipo/seção
  const imagesByType = images.reduce((acc, img) => {
    acc[img.type] ??= [];
    acc[img.type]!.push(img.url);
    return acc;
  }, {} as Record<string, string[]>);

  // Debug: log imagens agrupadas
  if (process.env.NODE_ENV === 'development') {
    console.log('📸 Imagens agrupadas por tipo:', imagesByType);
    console.log('📸 Total de imagens:', images.length);
  }

  // ===========================
  // SEÇÃO 1: Planejamento
  // ===========================
  if (responsesBySection[1]) {
    formData.section1 = {} as any;
    
    for (const r of responsesBySection[1]) {
      const key = getQuestionKey(1, r.questionNumber, r.questionText);
      
      if (key) {
        // Se tem textValue, é um campo de texto
        if (r.textValue) {
          (formData.section1 as any)![key] = r.textValue;
          console.log(`✅ Seção 1 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          // Senão, é um enum (YES/NO/NA/PARTIAL)
          (formData.section1 as any)![key] = r.response;
          console.log(`✅ Seção 1 - Mapeado ${key}:`, r.response);
        }
      } else {
        // Debug: mostrar questões não mapeadas
        console.warn('⚠️ Questão não mapeada:', {
          section: 1,
          questionNumber: r.questionNumber,
          questionText: r.questionText,
          response: r.response,
        });
      }
    }

    // Fotos do PDST
    if (imagesByType.PDST_FRONT && imagesByType.PDST_FRONT.length > 0) {
      (formData.section1 as any).q11_foto_pdst = imagesByType.PDST_FRONT;
    }
  }

  // ===========================
  // SEÇÃO 2: Permissão de Trabalho
  // ===========================
  if (responsesBySection[2]) {
    formData.section2 = {} as any;
    
    for (const r of responsesBySection[2]) {
      const key = getQuestionKey(2, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          (formData.section2 as any)![key] = r.textValue;
          console.log(`✅ Seção 2 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          (formData.section2 as any)![key] = r.response;
          console.log(`✅ Seção 2 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 2:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }

    // Fotos da PT
    if (imagesByType.PT_FRONT && imagesByType.PT_FRONT.length > 0) {
      (formData.section2 as any).q13_foto_pt = imagesByType.PT_FRONT;
    }
  }

  // ===========================
  // SEÇÃO 3: Máquinas e Equipamentos
  // ===========================
  if (responsesBySection[3]) {
    formData.section3 = {} as any;
    
    for (const r of responsesBySection[3]) {
      const key = getQuestionKey(3, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          (formData.section3 as any)![key] = r.textValue;
          console.log(`✅ Seção 3 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          (formData.section3 as any)![key] = r.response;
          console.log(`✅ Seção 3 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 3:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }
  }

  // ===========================
  // SEÇÃO 4: Ferramentas
  // ===========================
  if (responsesBySection[4]) {
    formData.section4 = {} as any;
    
    for (const r of responsesBySection[4]) {
      const key = getQuestionKey(4, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          (formData.section4 as any)![key] = r.textValue;
          console.log(`✅ Seção 4 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          (formData.section4 as any)![key] = r.response;
          console.log(`✅ Seção 4 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 4:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }
  }

  // ===========================
  // SEÇÃO 5: Veículos
  // ===========================
  if (responsesBySection[5]) {
    formData.section5 = {} as any;
    
    for (const r of responsesBySection[5]) {
      const key = getQuestionKey(5, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          (formData.section5 as any)![key] = r.textValue;
          console.log(`✅ Seção 5 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          (formData.section5 as any)![key] = r.response;
          console.log(`✅ Seção 5 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 5:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }
  }

  // ===========================
  // SEÇÃO 6: Instalações
  // ===========================
  if (responsesBySection[6]) {
    formData.section6 = {} as any;
    
    for (const r of responsesBySection[6]) {
      const key = getQuestionKey(6, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          (formData.section6 as any)![key] = r.textValue;
          console.log(`✅ Seção 6 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          (formData.section6 as any)![key] = r.response;
          console.log(`✅ Seção 6 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 6:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }
  }

  // ===========================
  // SEÇÃO 7: Escavações
  // ===========================
  if (responsesBySection[7]) {
    formData.section7 = {} as any;
    
    for (const r of responsesBySection[7]) {
      const key = getQuestionKey(7, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          // q25_profundidade é número
          if (key === 'q25_profundidade') {
            (formData.section7 as any)![key] = Number.parseFloat(r.textValue);
            console.log(`✅ Seção 7 - Mapeado ${key} (número):`, r.textValue);
          } else {
            (formData.section7 as any)![key] = r.textValue;
            console.log(`✅ Seção 7 - Mapeado ${key} (textValue):`, r.textValue);
          }
        } else {
          (formData.section7 as any)![key] = r.response;
          console.log(`✅ Seção 7 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 7:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }
  }

  // ===========================
  // SEÇÃO 8: Parecer Final
  // ===========================
  if (responsesBySection[8]) {
    formData.section8 = {} as any;
    
    for (const r of responsesBySection[8]) {
      const key = getQuestionKey(8, r.questionNumber, r.questionText);
      
      if (key) {
        if (r.textValue) {
          (formData.section8 as any)![key] = r.textValue;
          console.log(`✅ Seção 8 - Mapeado ${key} (textValue):`, r.textValue);
        } else {
          (formData.section8 as any)![key] = r.response;
          console.log(`✅ Seção 8 - Mapeado ${key}:`, r.response);
        }
      } else {
        console.warn('⚠️ Questão não mapeada na Seção 8:', { questionNumber: r.questionNumber, questionText: r.questionText });
      }
    }
  }

  // ===========================
  // SEÇÃO 9: Fotos Gerais
  // ===========================
  if (imagesByType.GENERAL && imagesByType.GENERAL.length > 0) {
    formData.section9 = {
      fotos_gerais: imagesByType.GENERAL,
    };
  }

  return formData;
}

/**
 * Mapeia número da questão e texto para a chave correta do formulário
 * 
 * Ex: (1, 1, "A equipe foi integrada?") -> "q1_equipe_integrada"
 * 
 * IMPORTANTE: As chaves devem corresponder EXATAMENTE às definidas em inspection-schema.ts
 */
function getQuestionKey(
  sectionNumber: number,
  questionNumber: number,
  questionText: string
): string | null {
  // Primeiro, tentar detectar questões condicionais via texto
  const conditionalKey = getConditionalQuestionKey(questionText);
  if (conditionalKey) {
    return conditionalKey;
  }

  // Mapeamento preciso baseado em inspection-schema.ts
  const keyMap: Record<string, Record<number, string>> = {
    '1': {
      1: 'q1_equipe_integrada',
      2: 'q2_cracha_visivel',
      3: 'q3_lider_presente',
      4: 'q4_pdst_elaborado',
      5: 'q5_pdst_passos_adequados',
      6: 'q6_riscos_condizentes',
      7: 'q7_barreiras_controle',
      8: 'q8_pdst_assinado',
      9: 'q9_lider_identificado',
      10: 'q10_reuniao_pretrab',
    },
    '2': {
      11: 'q11_pt_emitida',
      12: 'q12_emitente_treinado',
    },
    '3': {
      14: 'q14_usa_equipamentos',
    },
    '4': {
      15: 'q15_usa_maquinas',
      16: 'q16_cunhas_disponiveis',
      17: 'q17_caminhoes_calcos',
    },
    '5': {
      18: 'q18_uso_epi',
      19: 'q19_epi_adequado',
      20: 'q20_bolsa_epi',
      21: 'q21_lanterna_noturna',
    },
    '6': {
      22: 'q22_local_sinalizado',
      23: 'q23_veiculos_barreira',
      24: 'q24_dispositivos_luminosos',
    },
    '7': {
      25: 'q25_escavacao_profunda',
      26: 'q26_materiais_distantes',
    },
    '8': {
      27: 'q27_equipe_consciente',
      28: 'q28_fortalecer_realizado',
      29: 'q29_indicacao_fortalecer',
      30: 'q30_paralisacao',
      31: 'q31_nc_pendentes',
    },
  };

  const sectionKey = sectionNumber.toString();
  return keyMap[sectionKey]?.[questionNumber] || null;
}

/**
 * Detecta questões condicionais baseado no texto da pergunta
 */
function getConditionalQuestionKey(questionText: string): string | null {
  const conditionalPatterns: Array<{ pattern: string | string[]; key: string }> = [
    // Seção 3 - Equipamentos
    { pattern: ['Quais equipamentos', 'lista de equipamentos'], key: 'q14_equipamentos_lista' },
    { pattern: 'inspecionados e liberadas', key: 'q14_1_inspecionados' },
    { pattern: 'operador do equipamento possui treinamento', key: 'q14_2_operador_treinado' },
    { pattern: 'checklist de pré-uso do equipamento', key: 'q14_4_checklist_preuso' },
    { pattern: 'combustível utilizado', key: 'q14_5_combustivel_certificado' },
    { pattern: 'Ficha de Dados de Segurança', key: 'q14_6_fds_disponivel' },
    { pattern: 'equipamentos são transportados', key: 'q14_7_transporte_seguro' },
    
    // Seção 4 - Máquinas
    { pattern: ['Quais máquinas', 'lista de máquinas'], key: 'q15_maquinas_lista' },
    { pattern: 'máquina foi inspecionada', key: 'q15_1_maquina_inspecionada' },
    { pattern: 'operador de máquina possui treinamento', key: 'q15_2_operador_treinado' },
    { pattern: 'operador de máquina possui crachá', key: 'q15_3_operador_cracha' },
    { pattern: 'checklist de pré-uso da máquina', key: 'q15_4_checklist_maquina' },
    { pattern: 'área de movimentação de carga', key: 'q15_5_area_isolada' },
    { pattern: 'Acessórios de içamento', key: 'q15_6_acessorios_inspecionados' },
    { pattern: 'Cargas estão sendo guiadas', key: 'q15_7_cargas_guiadas' },
    
    // Seção 7 - Escavações
    { pattern: 'Escoramento ou rampa', key: 'q25_1_escoramento' },
    { pattern: 'Escadas ou rampas de acesso', key: 'q25_2_escadas_acesso' },
    
    // Seção 8 - Parecer Final
    { pattern: ['temas foram abordados', 'Quais temas'], key: 'q28_temas' },
    { pattern: ['nomes dos funcion', 'Indicar nomes'], key: 'q29_nomes' },
    { pattern: ['conformidades pendentes', 'Descrever não'], key: 'q31_descricao_nc' },
  ];

  for (const { pattern, key } of conditionalPatterns) {
    if (Array.isArray(pattern)) {
      if (pattern.some(p => questionText.includes(p))) {
        return key;
      }
    } else if (questionText.includes(pattern)) {
      return key;
    }
  }

  return null;
}
