import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default async function AdminInspectionsPage() {
  await requireAdmin();

  // Buscar todas as inspeções com informações do usuário
  const inspections = await prisma.inspection.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limitar a 100 mais recentes
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          images: true,
          responses: true,
        },
      },
    },
  });

  // Estatísticas
  const stats = await prisma.inspection.groupBy({
    by: ['status'],
    _count: true,
  });

  const totalDrafts = stats.find((s) => s.status === 'DRAFT')?._count ?? 0;
  const totalSubmitted = stats.find((s) => s.status === 'SUBMITTED')?._count ?? 0;
  const totalArchived = stats.find((s) => s.status === 'ARCHIVED')?._count ?? 0;
  const totalInspections = totalDrafts + totalSubmitted + totalArchived;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                📋 Todas as Inspeções
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualização completa de todas as inspeções do sistema
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">← Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Inspeções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {totalInspections}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {totalDrafts}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {totalSubmitted}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Arquivadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-600">
                {totalArchived}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inspections List */}
        <Card>
          <CardHeader>
            <CardTitle>Inspeções Recentes</CardTitle>
            <CardDescription>
              Últimas 100 inspeções criadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inspections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma inspeção cadastrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inspections.map((inspection) => (
                  <Link
                    key={inspection.id}
                    href={`/inspection/${inspection.id}`}
                    className="block"
                  >
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-medium text-blue-600">
                              #{inspection.number}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                inspection.status === 'DRAFT'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : inspection.status === 'SUBMITTED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {inspection.status === 'DRAFT'
                                ? 'Rascunho'
                                : inspection.status === 'SUBMITTED'
                                  ? 'Enviada'
                                  : 'Arquivada'}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mt-2">
                            {inspection.title || 'Sem título'}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>👤 {inspection.user.name}</span>
                            <span>📧 {inspection.user.email}</span>
                            <span>📅 {formatDateTime(inspection.createdAt)}</span>
                            {inspection.location && (
                              <span>📍 {inspection.location}</span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>🖼️ {inspection._count.images} imagens</span>
                            <span>
                              ✓ {inspection._count.responses} respostas
                            </span>
                          </div>
                        </div>
                        <svg
                          className="h-5 w-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
