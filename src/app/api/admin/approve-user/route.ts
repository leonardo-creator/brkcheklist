import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/approve-user
 * Aprovar um usuário pendente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Aprovar o usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        approvedBy: session.user.id,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    console.log(`✅ Usuário ${user.email} aprovado por ${session.user.email}`);

    // Redirecionar de volta para a página de administração
    return NextResponse.redirect(new URL('/admin/users', request.url));
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao aprovar usuário' },
      { status: 500 }
    );
  }
}
