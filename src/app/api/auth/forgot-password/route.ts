/**
 * Password Reset Request API
 * 
 * Generates password reset token and sends email with reset link.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'node:crypto';

const POWER_AUTOMATE_WEBHOOK = process.env.POWER_AUTOMATE_WEBHOOK_URL;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, sempre retorna sucesso mesmo se usuário não existe
    // Isso previne enumeração de emails
    if (!user) {
      return NextResponse.json({
        message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.',
      });
    }

    // Verifica se usuário tem senha (não é apenas OAuth)
    if (!user.password) {
      return NextResponse.json({
        message: 'Esta conta usa login social (Google). Não é possível redefinir senha.',
      });
    }

    // Gera token único
    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Deleta tokens antigos do usuário
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Cria novo token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires,
      },
    });

    // Envia email via Power Automate
    const resetUrl = `${NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    if (POWER_AUTOMATE_WEBHOOK) {
      try {
        await fetch(POWER_AUTOMATE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'password_reset_request',
            user: {
              name: user.name,
              email: user.email,
            },
            resetUrl,
            expiresAt: expires,
          }),
        });
      } catch (webhookError) {
        console.error('Failed to send reset email:', webhookError);
        return NextResponse.json(
          { error: 'Erro ao enviar email. Tente novamente.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}
