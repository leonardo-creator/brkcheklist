import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createStorageService } from '@/lib/storage';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/upload
 * Upload de imagem para storage configurado no .env e retorno do link público
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

    // Criar serviço de storage baseado nas configurações do .env
    const storageService = createStorageService();

    // Criar pasta temporária (será movida quando a inspeção for salva)
    const userId = session.user.email?.split('@')[0] || 'temp';
    const folderPath = `temp/${userId}`;

    // Upload do arquivo
    const uploadResult = await storageService.uploadFile(
      optimizedBuffer,
      fileName,
      folderPath,
      'image/jpeg'
    );

    return NextResponse.json({
      url: uploadResult.url,
      fileName: uploadResult.fileName,
      size: uploadResult.size || optimizedBuffer.length,
      originalSize: file.size,
      fileId: uploadResult.fileId || fileName,
    });
  } catch (error: unknown) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
