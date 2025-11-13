import { notFound, redirect } from 'next/navigation';
import { requireApprovedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { InspectionForm } from '@/components/inspection/inspection-form';
import { mapResponsesToFormData } from '@/lib/response-mapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditInspectionPage({ params }: PageProps) {
  const session = await requireApprovedUser();
  const { id } = await params;

  // Buscar inspeção com todas as relações
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      responses: true,
      images: true,
    },
  });

  if (!inspection) {
    notFound();
  }

  // Verificar se o usuário é dono da inspeção
  if (inspection.userId !== session.user.id) {
    redirect('/dashboard');
  }

  // Apenas rascunhos podem ser editados
  if (inspection.status !== 'DRAFT') {
    redirect(`/inspection/${id}`);
  }

  // Mapear respostas para o formato do formulário
  const initialData = mapResponsesToFormData(
    inspection.responses,
    inspection.images
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/inspection/${inspection.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="text-sm text-gray-500">
            Editando Inspeção #{inspection.number.toString().padStart(4, '0')}
          </div>
        </div>

        {/* Formulário com dados iniciais */}
        <InspectionForm
          mode="edit"
          inspectionId={inspection.id}
          initialData={{
            title: inspection.title || '',
            location: inspection.latitude && inspection.longitude
              ? {
                  latitude: inspection.latitude,
                  longitude: inspection.longitude,
                  address: inspection.location || '',
                }
              : undefined,
            ...initialData,
          }}
        />
      </div>
    </div>
  );
}
