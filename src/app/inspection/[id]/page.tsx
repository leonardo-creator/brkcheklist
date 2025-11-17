import { notFound, redirect } from 'next/navigation';
import { requireApprovedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InspectionDetailPage({ params }: PageProps) {
  const session = await requireApprovedUser();
  const { id } = await params;

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      responses: true,
      images: true,
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!inspection) {
    notFound();
  }

  // Verificar se o usuário é o dono ou admin
  if (inspection.userId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const statusColors = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    SUBMITTED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Enviada',
    ARCHIVED: 'Arquivada',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="flex gap-2">
            {(inspection.status === 'DRAFT' || session.user.role === 'ADMIN') && (
              <Link href={`/inspection/${inspection.id}/edit`}>
                <Button variant="outline">
                  {session.user.role === 'ADMIN' && inspection.status === 'SUBMITTED' 
                    ? 'Editar (Admin)' 
                    : 'Editar'}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Informações principais */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Inspeção #{inspection.number.toString().padStart(4, '0')}
                </CardTitle>
                {inspection.title && (
                  <p className="text-muted-foreground mt-1">{inspection.title}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[inspection.status]
                }`}
              >
                {statusLabels[inspection.status]}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Inspetor</p>
                  <p className="font-medium">{inspection.user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">
                    {new Date(inspection.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {inspection.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-medium">{inspection.location}</p>
                  </div>
                </div>
              )}
            </div>

            {inspection.latitude && inspection.longitude && (
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps?q=${inspection.latitude},${inspection.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver no Google Maps →
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Respostas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Respostas da Inspeção</CardTitle>
          </CardHeader>
          <CardContent>
            {inspection.responses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma resposta registrada ainda.
              </p>
            ) : (
              <div className="space-y-6">
                {Array.from(
                  new Map(
                    inspection.responses.map((r) => [
                      r.sectionNumber,
                      { sectionNumber: r.sectionNumber, sectionTitle: r.sectionTitle },
                    ])
                  ).values()
                )
                  .sort((a, b) => a.sectionNumber - b.sectionNumber)
                  .map((section) => {
                    const sectionResponses = inspection.responses.filter(
                      (r) => r.sectionNumber === section.sectionNumber
                    );
                    return (
                      <div key={section.sectionNumber} className="border-b pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Seção {section.sectionNumber}: {section.sectionTitle}
                        </h3>
                        <div className="space-y-3">
                          {sectionResponses.map((response) => (
                            <div
                              key={response.id}
                              className="bg-gray-50 p-3 rounded-lg"
                            >
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                {response.questionNumber}. {response.questionText}
                              </p>
                              <p className="mt-2">
                                <span
                                  className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                                    response.response === 'YES'
                                      ? 'bg-green-100 text-green-800'
                                      : response.response === 'NO'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {response.response === 'YES'
                                    ? 'Sim'
                                    : response.response === 'NO'
                                    ? 'Não'
                                    : response.response === 'NA'
                                    ? 'N/A'
                                    : response.response === 'PARTIAL'
                                    ? 'Parcialmente'
                                    : response.textValue}
                                </span>
                              </p>
                              {response.textValue && response.response !== 'NA' && (
                                <p className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border">
                                  {response.textValue}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Imagens */}
        {inspection.images.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registro Fotográfico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inspection.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image.url || ''}
                        alt={image.originalName || image.caption || 'Imagem'}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {image.caption || image.originalName || 'Sem descrição'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Alterações */}
        {inspection.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspection.logs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="text-gray-500 min-w-[140px]">
                      {new Date(log.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.description}</p>
                      <p className="text-gray-500 text-xs">
                        por {log.userName || log.userEmail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
