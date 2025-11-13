'use client';

import React, { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image-utils';
import { getErrorMessage } from '@/lib/utils';

interface ImageUploadProps {
  readonly value?: string[];
  readonly onChange: (urls: string[]) => void;
  readonly maxImages?: number;
  readonly required?: boolean;
  readonly label?: string;
  readonly helpText?: string;
}

interface ImagePreview {
  url: string;
  name: string;
  uploading: boolean;
  error?: string;
}

const IMAGE_FALLBACK_MESSAGE = 'Erro ao carregar imagem';

const updatePreviewArray = (
  previews: ImagePreview[],
  index: number,
  updater: (preview: ImagePreview) => ImagePreview
): ImagePreview[] =>
  previews.map((preview, currentIndex) =>
    currentIndex === index ? updater(preview) : preview
  );

export function ImageUpload({
  value = [],
  onChange,
  maxImages,
  required = false,
  label = 'Upload de Imagens',
  helpText,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [failedPersistedImages, setFailedPersistedImages] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSelected = value.length + previews.length;

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const markPreview = (index: number, updater: (preview: ImagePreview) => ImagePreview) => {
    setPreviews((prev) => updatePreviewArray(prev, index, updater));
  };

  const handlePreviewImageError = (index: number, message?: string) => {
    markPreview(index, (preview) => ({
      ...preview,
      uploading: false,
      error: message ?? IMAGE_FALLBACK_MESSAGE,
    }));
  };

  const markPersistedImageFailed = (url: string) => {
    setFailedPersistedImages((prev) => ({ ...prev, [url]: true }));
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    if (maxImages && totalSelected + files.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`);
      resetFileInput();
      return;
    }

    setIsUploading(true);

    const objectUrls: string[] = [];

    try {
      const basePreviewIndex = previews.length;
      const newPreviews: ImagePreview[] = files.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return {
          url,
          name: file.name,
          uploading: true,
        };
      });

      setPreviews((prev) => [...prev, ...newPreviews]);

      const uploadFile = async (
        file: File,
        previewIndex: number
      ): Promise<string | null> => {
        try {
          const { compressedFile } = await compressImage(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
          });

          const formData = new FormData();
          formData.append('file', compressedFile);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData: { error?: string; action?: string; connectUrl?: string } = await response
              .json()
              .catch(() => ({}));

            if (errorData.action === 'connect_onedrive') {
              alert(
                '⚠️ OneDrive não conectado!\n\n' +
                  'Você precisa conectar sua conta Microsoft para fazer upload de imagens.\n\n' +
                  'Clique em OK para conectar agora.'
              );
              const redirectUrl = errorData.connectUrl ?? '/api/onedrive/login';
              globalThis.location.href = redirectUrl;
              handlePreviewImageError(previewIndex, 'OneDrive não conectado');
              return null;
            }

            throw new Error(errorData.error || `Erro ${response.status}`);
          }

          const data: { url: string } = await response.json();
          markPreview(previewIndex, (preview) => ({ ...preview, uploading: false }));
          return data.url;
        } catch (error) {
          const message = getErrorMessage(error, IMAGE_FALLBACK_MESSAGE);
          handlePreviewImageError(previewIndex, message);
          return null;
        }
      };

      const uploadResults = await Promise.all(
        files.map((file, index) => uploadFile(file, basePreviewIndex + index))
      );

      objectUrls.forEach((url) => URL.revokeObjectURL(url));

      const successfulUrls = uploadResults.filter((url): url is string => Boolean(url));
      const failedCount = files.length - successfulUrls.length;

      if (successfulUrls.length > 0) {
        onChange([...value, ...successfulUrls]);
      }

      setPreviews([]);

      if (failedCount > 0) {
        const successMsg = successfulUrls.length > 0
          ? `${successfulUrls.length} imagem(ns) enviada(s) com sucesso. `
          : '';
        alert(
          `${successMsg}${failedCount} imagem(ns) falharam. Verifique as mensagens de erro e tente novamente.`
        );
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Erro ao fazer upload das imagens');
      alert(message);
    } finally {
      setIsUploading(false);
      resetFileInput();
    }
  };

  const handleRemoveImage = (targetUrl: string) => {
    onChange(value.filter((url) => url !== targetUrl));
    setFailedPersistedImages((prev) => {
      if (!prev[targetUrl]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[targetUrl];
      return updated;
    });
  };

  const handleRemovePreview = (index: number) => {
    setPreviews((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });
  };

  const renderFallback = (message: string, tone: 'default' | 'error' = 'default') => (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center ${
        tone === 'error' ? 'text-red-500' : 'text-gray-400'
      }`}
    >
      <ImageIcon className="h-8 w-8 mb-2" />
      <p className="text-xs text-center px-2">{message}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={
          isUploading || (maxImages !== undefined && totalSelected >= maxImages)
        }
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={
          isUploading || (maxImages !== undefined && totalSelected >= maxImages)
        }
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {maxImages
              ? `Selecionar Imagens (${totalSelected}/${maxImages})`
              : `Selecionar Imagens (${totalSelected})`}
          </>
        )}
      </Button>

      {(value.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {value.map((url) => (
            <div key={url} className="relative group">
              <div className="aspect-square relative rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                {failedPersistedImages[url] ? (
                  renderFallback(IMAGE_FALLBACK_MESSAGE, 'error')
                ) : (
                  <Image
                    src={url}
                    alt="Imagem enviada"
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    onError={() => markPersistedImageFailed(url)}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {previews.map((preview, index) => (
            <div key={preview.url} className="relative group">
              <div className="aspect-square relative rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                {preview.error ? (
                  renderFallback(preview.error, 'error')
                ) : (
                  <>
                    <Image
                      src={preview.url}
                      alt={preview.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover opacity-60"
                      onError={() => handlePreviewImageError(index)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  </>
                )}
              </div>
              {preview.error && (
                <button
                  type="button"
                  onClick={() => handleRemovePreview(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  title="Remover imagem com erro"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && previews.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Nenhuma imagem adicionada</p>
        </div>
      )}
    </div>
  );
}
