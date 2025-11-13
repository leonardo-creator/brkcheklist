import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/onedrive/callback
 * Recebe código de autorização e troca por tokens
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Verificar se houve erro no OAuth
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/dashboard?onedrive_error=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    // Validar code
    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?onedrive_error=no_code', request.url)
      );
    }

    // Validar state (deve ser o user ID)
    if (state !== session.user.id) {
      return NextResponse.redirect(
        new URL('/dashboard?onedrive_error=invalid_state', request.url)
      );
    }

    // Trocar código por tokens
    const tokenUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code: code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      grant_type: 'authorization_code',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Token exchange error:', errorData);
      return NextResponse.redirect(
        new URL(
          `/dashboard?onedrive_error=${encodeURIComponent(errorData.error || 'token_exchange_failed')}`,
          request.url
        )
      );
    }

    const tokens = await response.json();

    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Salvar tokens no banco de dados
    await prisma.oneDriveToken.upsert({
      where: { userId: session.user.id },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt,
        scope: tokens.scope,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt,
        scope: tokens.scope,
      },
    });

    // Redirecionar de volta para dashboard com sucesso
    return NextResponse.redirect(
      new URL('/dashboard?onedrive_connected=true', request.url)
    );
  } catch (error) {
    console.error('OneDrive callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?onedrive_error=callback_failed', request.url)
    );
  }
}
