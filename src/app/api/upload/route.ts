import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OneDriveService, getOneDriveAccessToken } from '@/lib/onedrive';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/upload
 * Upload de imagem para OneDrive e retorno do link público
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      );
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Otimizar imagem com sharp (redimensionar e comprimir)
    // SEMPRE salva como JPEG após otimização
    const optimizedBuffer = await sharp(inputBuffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Gerar nome único para o arquivo
    // SEMPRE usa extensão .jpg porque Sharp converte para JPEG
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `IMG_${timestamp}_${randomString}.jpg`;

    // Obter access token do OneDrive (usando OAuth do usuário)
    let accessToken: string;
    try {
      accessToken = await getOneDriveAccessToken(session.user.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao obter token do OneDrive';
      return NextResponse.json(
        { 
          error: errorMsg,
          action: 'connect_onedrive',
          connectUrl: '/api/onedrive/login'
        },
        { status: 403 }
      );
    }

    const oneDriveService = new OneDriveService({ accessToken });

    // Criar pasta temporária (será movida quando a inspeção for salva)
    const userId = session.user.email?.split('@')[0] || 'temp';
    const folderPath = `BRK_Inspecoes/temp/${userId}`;

    // Upload do arquivo
    let uploadResult;
    if (optimizedBuffer.length > 4 * 1024 * 1024) {
      // Se > 4MB, usar upload chunked
      uploadResult = await oneDriveService.uploadLargeFile(
        optimizedBuffer,
        fileName,
        folderPath,
        'image/jpeg'
      );
    } else {
      // Upload simples
      uploadResult = await oneDriveService.uploadImage(
        optimizedBuffer,
        fileName,
        folderPath,
        'image/jpeg'
      );
    }

    return NextResponse.json({
      url: uploadResult.shareLink || uploadResult.webUrl,
      fileName: fileName,
      size: optimizedBuffer.length,
      originalSize: file.size,
      fileId: uploadResult.id,
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
