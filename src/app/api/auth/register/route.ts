/**
 * User Registration API
 * 
 * Creates new user accounts with email/password authentication.
 * New users start with PENDING role and require admin approval.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/password';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const POWER_AUTOMATE_WEBHOOK = process.env.POWER_AUTOMATE_WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validação de campos obrigatórios
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
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

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Cria usuário com status PENDING
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Notifica admin sobre novo cadastro
    if (POWER_AUTOMATE_WEBHOOK) {
      try {
        await fetch(POWER_AUTOMATE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_user_registration',
            user: {
              name: user.name,
              email: user.email,
              registeredAt: user.createdAt,
            },
            adminEmail: ADMIN_EMAIL,
            approvalUrl: `${process.env.NEXTAUTH_URL}/admin/users`,
          }),
        });
      } catch (webhookError) {
        console.error('Failed to send admin notification:', webhookError);
        // Não falha o registro se o webhook falhar
      }
    }

    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso! Aguardando aprovação do administrador.',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
