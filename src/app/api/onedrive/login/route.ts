import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * GET /api/onedrive/login
 * Inicia o fluxo OAuth 2.0 para autenticação OneDrive
 */
export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login primeiro.' },
        { status: 401 }
      );
    }

    // Validar variáveis de ambiente
    const requiredEnvVars = {
      MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
      MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
      MICROSOFT_REDIRECT_URI: process.env.MICROSOFT_REDIRECT_URI,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          error: 'Configuração incompleta do OneDrive',
          missing: missingVars,
        },
        { status: 500 }
      );
    }

    // Construir URL de autorização Microsoft
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'consumers';
    const scopes = process.env.ONEDRIVE_SCOPES || 'Files.ReadWrite offline_access';

    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      response_type: 'code',
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      response_mode: 'query',
      scope: scopes,
      state: session.user.id, // Usar user ID como state para validação
    });

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`;

    // Redirecionar para Microsoft
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OneDrive login:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação OneDrive' },
      { status: 500 }
    );
  }
}
