'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { compressImage } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number; // Opcional, sem limite por padrão
  required?: boolean;
  label?: string;
  helpText?: string;
}

interface ImagePreview {
  url: string;
  name: string;
  uploading: boolean;
  error?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages, // Sem limite por padrão
  required = false,
  label = 'Upload de Imagens',
  helpText,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Verificar limite de imagens (se definido)
    if (maxImages && value.length + files.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setUploading(true);

    try {
      // Criar previews iniciais
      const newPreviews: ImagePreview[] = files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        uploading: true,
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);

      // Upload de cada arquivo
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Comprimir imagem
          const result = await compressImage(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
          });

          // Preparar FormData
          const formData = new FormData();
          formData.append('file', result.compressedFile);

          // Upload para API
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Se for erro de OneDrive não conectado, mostrar alerta especial
            if (errorData.action === 'connect_onedrive') {
              alert(
                '⚠️ OneDrive não conectado!\n\n' +
                'Você precisa conectar sua conta Microsoft para fazer upload de imagens.\n\n' +
                'Clique em OK para conectar agora.'
              );
              window.location.href = errorData.connectUrl || '/api/onedrive/login';
              throw new Error('OneDrive não conectado');
            }
            
            const errorMsg = errorData.error || `Erro ${response.status}`;
            throw new Error(errorMsg);
          }

          const data = await response.json();
          console.log('✅ Upload bem-sucedido:', {
            fileName: data.fileName,
            url: data.url,
            size: data.size
          });
          return data.url;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`❌ Erro ao fazer upload de ${file.name}:`, errorMsg);
          
          // Atualizar preview com erro detalhado
          setPreviews((prev) =>
            prev.map((p, i) =>
              i === value.length + index
                ? { ...p, uploading: false, error: errorMsg }
                : p
            )
          );
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUrls = uploadedUrls.filter(
        (url): url is string => url !== null
      );
      
      const failedCount = files.length - successfulUrls.length;

      // Atualizar valor com URLs bem-sucedidas
      if (successfulUrls.length > 0) {
        const newUrls = [...value, ...successfulUrls];
        console.log('📸 Atualizando lista de imagens:', {
          antes: value.length,
          novas: successfulUrls.length,
          depois: newUrls.length,
          urls: newUrls
        });
        onChange(newUrls);
      }

      // Remover TODOS os previews após processamento
      setPreviews([]);

      // Notificar resultado
      if (failedCount > 0) {
        const successMsg = successfulUrls.length > 0 
          ? `${successfulUrls.length} imagem(ns) enviada(s) com sucesso. `
          : '';
        alert(`${successMsg}${failedCount} imagem(ns) falharam. Verifique os erros nas imagens marcadas em vermelho.`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao fazer upload das imagens: ${errorMsg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleRemovePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helpText && (
          <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || (maxImages !== undefined && value.length >= maxImages)}
      />

      {/* Botão de Upload */}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || (maxImages !== undefined && value.length >= maxImages)}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {maxImages 
              ? `Selecionar Imagens (${value.length}/${maxImages})`
              : `Selecionar Imagens (${value.length})`
            }
          </>
        )}
      </Button>

      {/* Grid de Imagens - Mobile Optimized */}
      {(value.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Imagens carregadas */}
          {value.map((url, index) => {
            console.log(`🖼️ Renderizando imagem ${index + 1}:`, url);
            return (
              <div key={`image-${index}`} className="relative group">
                <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={url}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback se imagem não carregar
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <svg class="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs text-center">Erro ao carregar</p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Remover imagem"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {/* Previews em upload */}
          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative group">
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                {preview.error ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-xs text-center px-2">{preview.error}</p>
                  </div>
                ) : (
                  <>
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-full object-cover opacity-50"
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
                  title="Remover"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {value.length === 0 && previews.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Nenhuma imagem adicionada</p>
        </div>
      )}
    </div>
  );
}
