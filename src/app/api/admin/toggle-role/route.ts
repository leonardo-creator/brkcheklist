import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/toggle-role
 * Alternar role entre USER e ADMIN
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

    // Não permitir alterar a própria role
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode alterar sua própria role' },
        { status: 400 }
      );
    }

    // Alternar role
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    console.log(
      `🔄 Role de ${user.email} alterada de ${user.role} para ${newRole} por ${session.user.email}`
    );

    // Redirecionar de volta para a página de administração
    return NextResponse.redirect(new URL('/admin/users', request.url));
  } catch (error) {
    console.error('Erro ao alterar role:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar role do usuário' },
      { status: 500 }
    );
  }
}
