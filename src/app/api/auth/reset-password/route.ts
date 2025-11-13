/**
 * Password Reset Confirmation API
 * 
 * Validates reset token and updates user password.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validação de campos obrigatórios
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de senhas iguais
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    // Validação de força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Busca token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verifica expiração
    if (resetToken.expires < new Date()) {
      // Deleta token expirado
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo link de redefinição.' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(password);

    // Atualiza senha do usuário
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Deleta token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Deleta todos os outros tokens do usuário
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return NextResponse.json({
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha. Tente novamente.' },
      { status: 500 }
    );
  }
}
