'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteDraftButtonProps {
  inspectionId: string;
  inspectionNumber: number;
}

export function DeleteDraftButton({ inspectionId, inspectionNumber }: DeleteDraftButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegação do Link pai
    e.stopPropagation();

    const confirmed = confirm(
      `Tem certeza que deseja excluir o rascunho #${inspectionNumber}?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/inspections/${inspectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir');
      }

      // Atualizar página
      router.refresh();
    } catch (error) {
      console.error('Erro ao excluir inspeção:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao excluir rascunho. Tente novamente.'
      );
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      title="Excluir rascunho"
    >
      {isDeleting ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
