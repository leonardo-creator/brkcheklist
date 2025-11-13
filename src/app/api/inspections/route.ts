import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InspectionFormSchema, QUESTION_LABELS } from '@/lib/inspection-schema';
import { z } from 'zod';

/**
 * Extrai o número da questão de uma chave (ex: "q1_equipe_integrada" -> 1)
 */
function extractQuestionNumber(key: string): number {
  const regex = /^q(\d+)/;
  const match = regex.exec(key);
  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

/**
 * Converte string para tipo ResponseType do Prisma
 */
function toResponseType(value: string): 'YES' | 'NO' | 'NA' | 'PARTIAL' {
  const normalized = value.toUpperCase();
  if (['YES', 'NO', 'NA', 'PARTIAL'].includes(normalized)) {
    return normalized as 'YES' | 'NO' | 'NA' | 'PARTIAL';
  }
  return 'NA'; // Fallback
}

/**
 * Mapeia os dados do formulário para respostas do banco
 */
function mapFormDataToResponses(formData: z.infer<typeof InspectionFormSchema>) {
  const responses: Array<{
    sectionNumber: number;
    sectionTitle: string;
    questionNumber: number;
    questionText: string;
    response: 'YES' | 'NO' | 'NA' | 'PARTIAL';
    textValue?: string;
    listValues?: string[];
  }> = [];

  // Seção 1: Planejamento e Integração
  if (formData.section1) {
    const section = formData.section1;
    const sectionNumber = 1;
    const sectionTitle = 'PLANEJAMENTO E INTEGRAÇÃO DA EQUIPE';

    for (const [key, value] of Object.entries(section)) {
      if (key === 'q11_foto_pdst') {
        // Imagens são salvas separadamente
        continue;
      }

      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        responses.push({
          sectionNumber,
          sectionTitle,
          questionNumber: extractQuestionNumber(key),
          questionText,
          response: toResponseType(String(value)),
        });
      }
    }
  }

  // Seção 2: Permissão de Trabalho
  if (formData.section2) {
    const section = formData.section2;
    const sectionNumber = 2;
    const sectionTitle = 'PERMISSÃO DE TRABALHO';

    for (const [key, value] of Object.entries(section)) {
      if (key === 'q13_foto_pt') {
        continue; // Imagens separadas
      }

      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        responses.push({
          sectionNumber,
          sectionTitle,
          questionNumber: extractQuestionNumber(key),
          questionText,
          response: toResponseType(String(value)),
        });
      }
    }
  }

  // Seção 3: Máquinas e Equipamentos
  if (formData.section3) {
    const section = formData.section3;
    const sectionNumber = 3;
    const sectionTitle = 'MÁQUINAS E EQUIPAMENTOS';

    for (const [key, value] of Object.entries(section)) {
      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        // Se é lista de equipamentos, salva como textValue
        if (key === 'q14_equipamentos_lista') {
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: 14,
            questionText: 'Quais equipamentos?',
            response: 'NA', // Placeholder para campo de texto
            textValue: String(value),
          });
        } else {
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: extractQuestionNumber(key),
            questionText,
            response: toResponseType(String(value)),
          });
        }
      }
    }
  }

  // Seção 4: Movimentação de Cargas
  if (formData.section4) {
    const section = formData.section4;
    const sectionNumber = 4;
    const sectionTitle = 'MOVIMENTAÇÃO DE CARGAS';

    for (const [key, value] of Object.entries(section)) {
      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        if (key === 'q15_maquinas_lista') {
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: 15,
            questionText: 'Quais máquinas?',
            response: 'NA', // Placeholder
            textValue: String(value),
          });
        } else {
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: extractQuestionNumber(key),
            questionText,
            response: toResponseType(String(value)),
          });
        }
      }
    }
  }

  // Seção 5: EPIs
  if (formData.section5) {
    const section = formData.section5;
    const sectionNumber = 5;
    const sectionTitle = 'EPIs';

    for (const [key, value] of Object.entries(section)) {
      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        responses.push({
          sectionNumber,
          sectionTitle,
          questionNumber: extractQuestionNumber(key),
          questionText,
          response: toResponseType(String(value)),
        });
      }
    }
  }

  // Seção 6: Sinalização
  if (formData.section6) {
    const section = formData.section6;
    const sectionNumber = 6;
    const sectionTitle = 'SINALIZAÇÃO';

    for (const [key, value] of Object.entries(section)) {
      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        responses.push({
          sectionNumber,
          sectionTitle,
          questionNumber: extractQuestionNumber(key),
          questionText,
          response: toResponseType(String(value)),
        });
      }
    }
  }

  // Seção 7: Escavações
  if (formData.section7) {
    const section = formData.section7;
    const sectionNumber = 7;
    const sectionTitle = 'ESCAVAÇÕES';

    for (const [key, value] of Object.entries(section)) {
      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        responses.push({
          sectionNumber,
          sectionTitle,
          questionNumber: extractQuestionNumber(key),
          questionText,
          response: toResponseType(String(value)),
        });
      }
    }
  }

  // Seção 8: Parecer Final
  if (formData.section8) {
    const section = formData.section8;
    const sectionNumber = 8;
    const sectionTitle = 'PARECER FINAL';

    for (const [key, value] of Object.entries(section)) {
      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      if (questionText && value) {
        // Campos de texto especiais
        if (key === 'q28_temas' || key === 'q29_nomes' || key === 'q31_descricao_nc') {
          let text = '';
          if (key === 'q28_temas') {
            text = 'Quais temas foram abordados no FORTALECER?';
          } else if (key === 'q29_nomes') {
            text = 'Indicar nomes dos funcionários';
          } else {
            text = 'Descrever não conformidades pendentes';
          }
          
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: extractQuestionNumber(key),
            questionText: text,
            response: 'NA', // Placeholder
            textValue: String(value),
          });
        } else {
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: extractQuestionNumber(key),
            questionText,
            response: toResponseType(String(value)),
          });
        }
      }
    }
  }

  // Seção 9: Fotos gerais são salvas como InspectionImage separadamente

  return responses;
}

/**
 * GET /api/inspections
 * Lista todas as inspeções do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Filtros
    const where: Record<string, unknown> = { userId: user.id };
    if (status) {
      where.status = status;
    }

    // Contar total
    const total = await prisma.inspection.count({ where });

    // Buscar inspeções
    const inspections = await prisma.inspection.findMany({
      where,
      include: {
        responses: true,
        images: true,
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      inspections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar inspeções:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar inspeções' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inspections
 * Cria uma nova inspeção ou salva rascunho
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Validar dados apenas se status for SUBMITTED
    if (body.status === 'SUBMITTED') {
      try {
        InspectionFormSchema.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Validação falhou', details: error.errors },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    // Mapear respostas do formulário
    const responsesData = mapFormDataToResponses(body);

    // Deduplica respostas baseado na constraint única (inspectionId, sectionNumber, questionNumber)
    const uniqueResponses = responsesData.reduce((acc, current) => {
      const key = `${current.sectionNumber}-${current.questionNumber}`;
      // Mantém apenas a última ocorrência de cada combinação seção+questão
      acc.set(key, current);
      return acc;
    }, new Map<string, typeof responsesData[0]>());

    const deduplicatedResponses = Array.from(uniqueResponses.values());

    // Criar inspeção com todas as respostas em uma transação
    const inspection = await prisma.$transaction(async (tx) => {
      // 1. Criar inspeção
      const newInspection = await tx.inspection.create({
        data: {
          userId: user.id,
          status: body.status || 'DRAFT',
          title: body.title,
          latitude: body.location?.latitude,
          longitude: body.location?.longitude,
          location: body.location?.address,
          submittedAt: body.status === 'SUBMITTED' ? new Date() : null,
        },
      });

      // 2. Salvar todas as respostas (deduplicadas)
      if (deduplicatedResponses.length > 0) {
        await tx.inspectionResponse.createMany({
          data: deduplicatedResponses.map((r) => ({
            inspectionId: newInspection.id,
            sectionNumber: r.sectionNumber,
            sectionTitle: r.sectionTitle,
            questionNumber: r.questionNumber,
            questionText: r.questionText,
            response: r.response,
            textValue: r.textValue,
            listValues: r.listValues,
          })),
        });
      }

      // 3. Salvar imagens (PDST, PT, fotos gerais)
      const imageUrls: Array<{ 
        url: string; 
        caption?: string; 
        type: 'PDST_FRONT' | 'PT_FRONT' | 'GENERAL';
        sectionNumber?: number;
      }> = [];

      // Fotos do PDST (Seção 1)
      if (body.section1?.q11_foto_pdst) {
        for (const url of body.section1.q11_foto_pdst) {
          imageUrls.push({ 
            url, 
            caption: 'Foto do PDST', 
            type: 'PDST_FRONT',
            sectionNumber: 1
          });
        }
      }

      // Fotos da PT (Seção 2)
      if (body.section2?.q13_foto_pt) {
        for (const url of body.section2.q13_foto_pt) {
          imageUrls.push({ 
            url, 
            caption: 'Foto da Permissão de Trabalho', 
            type: 'PT_FRONT',
            sectionNumber: 2
          });
        }
      }

      // Fotos gerais (Seção 9)
      if (body.section9?.fotos_gerais) {
        for (const url of body.section9.fotos_gerais) {
          imageUrls.push({ 
            url, 
            caption: 'Registro fotográfico geral', 
            type: 'GENERAL',
            sectionNumber: 9
          });
        }
      }

      if (imageUrls.length > 0) {
        await tx.inspectionImage.createMany({
          data: imageUrls.map((img) => ({
            inspectionId: newInspection.id,
            url: img.url,
            caption: img.caption,
            type: img.type,
            sectionNumber: img.sectionNumber,
            uploadedBy: user.id,
          })),
        });
      }

      // 4. Log de criação
      await tx.inspectionLog.create({
        data: {
          inspectionId: newInspection.id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: body.status === 'SUBMITTED' ? 'SUBMITTED' : 'CREATED',
          description:
            body.status === 'SUBMITTED'
              ? `Inspeção criada e submetida com ${responsesData.length} respostas e ${imageUrls.length} imagens`
              : `Rascunho de inspeção criado com ${responsesData.length} respostas`,
          newValue: JSON.stringify({
            status: body.status || 'DRAFT',
            responsesCount: responsesData.length,
            imagesCount: imageUrls.length,
          }),
        },
      });

      return newInspection;
    });

    // Retornar inspeção com respostas e imagens incluídas
    const inspectionWithRelations = await prisma.inspection.findUnique({
      where: { id: inspection.id },
      include: {
        responses: true,
        images: true,
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(inspectionWithRelations, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao criar inspeção:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar inspeção' },
      { status: 500 }
    );
  }
}
