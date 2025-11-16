import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InspectionFormSchema, QUESTION_LABELS } from '@/lib/inspection-schema';
import { z } from 'zod';

/**
 * Extrai o número da questão de uma chave
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
  return 'NA';
}

/**
 * Mapeia os dados do formulário para respostas do banco
 * (mesma função usada no POST)
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

    console.log('🔍 Section1 raw data:', section);

    for (const [key, value] of Object.entries(section)) {
      if (key === 'q11_foto_pdst') continue;

      const questionText = QUESTION_LABELS[key as keyof typeof QUESTION_LABELS];
      console.log(`🔍 Processing ${key}:`, { value, questionText, hasLabel: !!questionText });
      
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
      if (key === 'q13_foto_pt') continue;

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
        if (key === 'q14_equipamentos_lista') {
          responses.push({
            sectionNumber,
            sectionTitle,
            questionNumber: 14,
            questionText: 'Quais equipamentos?',
            response: 'NA',
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
            response: 'NA',
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
            response: 'NA',
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

  return responses;
}

/**
 * GET /api/inspections/[id]
 * Busca uma inspeção específica com todas as relações
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar inspeção com todas as relações
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          orderBy: [
            { sectionNumber: 'asc' },
            { questionNumber: 'asc' },
          ],
        },
        images: {
          orderBy: { uploadedAt: 'asc' },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspeção não encontrada' }, { status: 404 });
    }

    // Verificar se é o dono ou admin
    if (inspection.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Você não tem permissão para ver esta inspeção' },
        { status: 403 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error: unknown) {
    console.error('Erro ao buscar inspeção:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar inspeção' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/inspections/[id]
 * Atualiza uma inspeção existente (apenas DRAFT)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Buscar inspeção existente
    const existingInspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!existingInspection) {
      return NextResponse.json({ error: 'Inspeção não encontrada' }, { status: 404 });
    }

    // Verificar se é o dono
    if (existingInspection.userId !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta inspeção' },
        { status: 403 }
      );
    }

    // Apenas DRAFT pode ser editado
    if (existingInspection.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Apenas rascunhos podem ser editados' },
        { status: 400 }
      );
    }

    // Validar dados se estiver enviando
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

    // Mapear respostas
    const responsesData = mapFormDataToResponses(body);

    console.log('📊 === SALVANDO RESPOSTAS ===');
    console.log('📊 Total responses before dedup:', responsesData.length);
    console.log('📊 Respostas por seção:', 
      Array.from(new Set(responsesData.map(r => r.sectionNumber)))
        .sort()
        .map(s => `Seção ${s}: ${responsesData.filter(r => r.sectionNumber === s).length}`)
    );
    console.log('📊 Sample responses:', responsesData.slice(0, 5));

    // Deduplica respostas baseado na constraint única (inspectionId, sectionNumber, questionNumber)
    const uniqueResponses = responsesData.reduce((acc, current) => {
      const key = `${current.sectionNumber}-${current.questionNumber}`;
      // Mantém apenas a última ocorrência de cada combinação seção+questão
      acc.set(key, current);
      return acc;
    }, new Map<string, typeof responsesData[0]>());

    const deduplicatedResponses = Array.from(uniqueResponses.values());
    
    console.log('📊 Total responses after dedup:', deduplicatedResponses.length);

    // Atualizar inspeção em transação (com timeout aumentado)
    const inspection = await prisma.$transaction(async (tx) => {
      // 1. Atualizar inspeção
      const updatedInspection = await tx.inspection.update({
        where: { id },
        data: {
          status: body.status || 'DRAFT',
          title: body.title,
          latitude: body.location?.latitude,
          longitude: body.location?.longitude,
          location: body.location?.address,
          submittedAt: body.status === 'SUBMITTED' ? new Date() : existingInspection.submittedAt,
        },
      });

      // 2. SUBSTITUIR TODAS as respostas (mais eficiente que UPSERT em loop)
      // Deletar todas as respostas existentes
      await tx.inspectionResponse.deleteMany({
        where: { inspectionId: id },
      });

      console.log('📋 Deleted old responses');
      console.log('📋 Creating new responses:', deduplicatedResponses.length);

      // Criar todas as novas respostas em lote
      if (deduplicatedResponses.length > 0) {
        await tx.inspectionResponse.createMany({
          data: deduplicatedResponses.map((response) => ({
            inspectionId: id,
            sectionNumber: response.sectionNumber,
            sectionTitle: response.sectionTitle,
            questionNumber: response.questionNumber,
            questionText: response.questionText,
            response: response.response,
            textValue: response.textValue,
            listValues: response.listValues,
          })),
        });
        console.log(`✨ Created ${deduplicatedResponses.length} responses in batch`);
      }

      // 3. SUBSTITUIR TODAS as imagens (mais eficiente)
      // Deletar todas as imagens existentes
      await tx.inspectionImage.deleteMany({
        where: { inspectionId: id },
      });

      console.log('🖼️ Deleted old images');

      // Coletar novas imagens do formulário
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
            sectionNumber: 1,
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
            sectionNumber: 2,
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
            sectionNumber: 9,
          });
        }
      }

      console.log('🖼️ New images to process:', imageUrls.length);

      // Criar todas as novas imagens em lote
      if (imageUrls.length > 0) {
        await tx.inspectionImage.createMany({
          data: imageUrls.map((img) => ({
            inspectionId: id,
            url: img.url,
            caption: img.caption,
            type: img.type,
            sectionNumber: img.sectionNumber,
            uploadedBy: user.id,
          })),
        });
        console.log(`✨ Created ${imageUrls.length} images in batch`);
      }

      // 4. Log de atualização
      await tx.inspectionLog.create({
        data: {
          inspectionId: id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: body.status === 'SUBMITTED' ? 'EDITED_AFTER_SUBMIT' : 'UPDATED',
          description:
            body.status === 'SUBMITTED'
              ? `Rascunho editado e submetido com ${responsesData.length} respostas e ${imageUrls.length} imagens`
              : `Rascunho atualizado com ${responsesData.length} respostas`,
          newValue: JSON.stringify({
            status: body.status || 'DRAFT',
            responsesCount: responsesData.length,
            imagesCount: imageUrls.length,
          }),
        },
      });

      return updatedInspection;
    }, {
      maxWait: 10000, // Espera máxima de 10s para obter lock
      timeout: 15000, // Timeout de 15s para executar a transação
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

    return NextResponse.json(inspectionWithRelations, { status: 200 });
  } catch (error: unknown) {
    console.error('Erro ao atualizar inspeção:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar inspeção' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inspections/[id]
 * Auto-save de rascunho (atualização parcial e rápida)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se a inspeção existe e pertence ao usuário
    const existingInspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!existingInspection) {
      return NextResponse.json({ error: 'Inspeção não encontrada' }, { status: 404 });
    }

    if (existingInspection.userId !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta inspeção' },
        { status: 403 }
      );
    }

    // Atualizar apenas campos básicos (auto-save rápido)
    const updatedInspection = await prisma.inspection.update({
      where: { id },
      data: {
        title: body.title,
        latitude: body.location?.latitude,
        longitude: body.location?.longitude,
        location: body.location?.address,
        status: body.status || existingInspection.status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      id: updatedInspection.id,
      message: 'Rascunho salvo automaticamente',
    });
  } catch (error: unknown) {
    console.error('Erro no auto-save:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar rascunho' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inspections/[id]
 * Exclui uma inspeção em rascunho
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se a inspeção existe e pertence ao usuário
    const existingInspection = await prisma.inspection.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        number: true,
      },
    });

    if (!existingInspection) {
      return NextResponse.json({ error: 'Inspeção não encontrada' }, { status: 404 });
    }

    if (existingInspection.userId !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir esta inspeção' },
        { status: 403 }
      );
    }

    // Apenas rascunhos podem ser excluídos
    if (existingInspection.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Apenas rascunhos podem ser excluídos' },
        { status: 400 }
      );
    }

    // Excluir inspeção (cascade deleta respostas, imagens e logs)
    await prisma.inspection.delete({
      where: { id },
    });

    // Log da exclusão
    console.log(`✅ Inspeção #${existingInspection.number} excluída por ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Rascunho excluído com sucesso',
    });
  } catch (error: unknown) {
    console.error('Erro ao excluir inspeção:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao excluir inspeção' },
      { status: 500 }
    );
  }
}
