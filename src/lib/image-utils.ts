import imageCompression from 'browser-image-compression';

interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Comprime uma imagem mantendo qualidade aceitável
 * @param file - Arquivo de imagem original
 * @param options - Opções de compressão com maxSizeMB e maxWidthOrHeight
 * @returns Imagem comprimida com metadados
 */
export async function compressImage(
  file: File,
  options: { maxSizeMB: number; maxWidthOrHeight: number }
): Promise<CompressionResult> {
  const compressionOptions = {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type,
    initialQuality: 0.9, // Mantém qualidade alta
    alwaysKeepResolution: false,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const compressionRatio = Number(
      ((1 - compressedSize / originalSize) * 100).toFixed(2)
    );

    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Se falhar, retorna o arquivo original
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
    };
  }
}

/**
 * Redimensiona imagem para thumbnail
 */
export async function createThumbnail(
  file: File,
  size = 300
): Promise<File> {
  const options = {
    maxSizeMB: 0.1, // 100KB max
    maxWidthOrHeight: size,
    useWebWorker: true,
    fileType: file.type,
  };

  return await imageCompression(file, options);
}

/**
 * Converte File para base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Extrai dimensões da imagem
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = reject;
    img.src = url;
  });
}
