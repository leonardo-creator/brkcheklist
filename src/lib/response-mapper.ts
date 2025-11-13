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

  // Agrupar respostas por seção
  const responsesBySection = responses.reduce((acc, r) => {
    acc[r.sectionNumber] ??= [];
    acc[r.sectionNumber]!.push(r);
    return acc;
  }, {} as Record<number, typeof responses>);

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
        } else {
          // Senão, é um enum (YES/NO/NA/PARTIAL)
          (formData.section1 as any)![key] = r.response;
        }
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
        } else {
          (formData.section2 as any)![key] = r.response;
        }
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
        } else {
          (formData.section3 as any)![key] = r.response;
        }
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
        } else {
          (formData.section4 as any)![key] = r.response;
        }
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
        } else {
          (formData.section5 as any)![key] = r.response;
        }
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
        } else {
          (formData.section6 as any)![key] = r.response;
        }
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
          } else {
            (formData.section7 as any)![key] = r.textValue;
          }
        } else {
          (formData.section7 as any)![key] = r.response;
        }
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
        } else {
          (formData.section8 as any)![key] = r.response;
        }
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
 */
function getQuestionKey(
  sectionNumber: number,
  questionNumber: number,
  questionText: string
): string | null {
  
  // Mapeamento manual das questões conhecidas
  // TODO: Idealmente isto deveria vir do QUESTION_LABELS invertido
  
  const keyMap: Record<string, Record<number, string>> = {
    // Seção 1
    '1': {
      1: 'q1_equipe_integrada',
      2: 'q2_equipe_mesma',
      3: 'q3_dds_realizado',
      // q3_observacao é detectado por textValue
      4: 'q4_pdst_vistoriado',
      5: 'q5_acesso_vias',
      6: 'q6_sinalizacao',
      7: 'q7_materiais_organizados',
      8: 'q8_descarte_correto',
      9: 'q9_rede_protegida',
      10: 'q10_cadastro_atualizado',
      // q11 é foto (não vai no responses)
    },
    // Seção 2
    '2': {
      12: 'q12_pt_analisada',
      // q13 é foto (não vai no responses)
    },
    // Seção 3
    '3': {
      14: 'q14_usa_equipamentos',
      // q14_equipamentos_lista é detectado por textValue
      15: 'q15_estado_conservacao',
      16: 'q16_protecao_partes',
      17: 'q17_protecao_rede',
      18: 'q18_area_isolada',
      19: 'q19_operadores_qualificados',
      20: 'q20_chave_partida',
    },
    // Seção 4
    '4': {
      21: 'q21_usa_maquinas',
      // Condicionais detectadas por textValue
    },
    // Seção 5
    '5': {
      22: 'q22_veiculo_conforme',
    },
    // Seção 6
    '6': {
      23: 'q23_instalacoes_conformes',
    },
    // Seção 7
    '7': {
      24: 'q24_escavacao_executada',
      25: 'q25_profundidade',
      26: 'q26_escavacao_escorada',
      27: 'q27_solo_analisado',
    },
    // Seção 8
    '8': {
      27: 'q27_fortalecer',
      28: 'q28_temas',
      29: 'q29_nomes',
      30: 'q30_nao_conformidades',
      31: 'q31_descricao_nc',
    },
  };

  // Casos especiais com textValue
  if (questionText.includes('observa')) {
    return 'q3_observacao';
  }
  if (questionText.includes('Quais equipamentos')) {
    return 'q14_equipamentos_lista';
  }
  if (questionText.includes('temas foram abordados')) {
    return 'q28_temas';
  }
  if (questionText.includes('nomes dos funcion')) {
    return 'q29_nomes';
  }
  if (questionText.includes('conformidades pendentes')) {
    return 'q31_descricao_nc';
  }

  const sectionKey = sectionNumber.toString();
  return keyMap[sectionKey]?.[questionNumber] || null;
}
