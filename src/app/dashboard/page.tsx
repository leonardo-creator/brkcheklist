import { requireApprovedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OneDriveAlert } from '@/components/onedrive-alert';
import { DeleteDraftButton } from '@/components/delete-draft-button';
import { formatDateTime } from '@/lib/utils';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onedrive_connected?: string; onedrive_error?: string }>;
}) {
  const session = await requireApprovedUser();
  const params = await searchParams;

  // Verificar se OneDrive está conectado
  const oneDriveToken = await prisma.oneDriveToken.findUnique({
    where: { userId: session.user.id },
    select: { expiresAt: true, updatedAt: true },
  });

  const isOneDriveConnected = oneDriveToken !== null;

  // Busca as últimas 5 inspeções do usuário
  const inspections = await prisma.inspection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      createdAt: true,
      submittedAt: true,
      location: true,
    },
  });

  // Estatísticas rápidas
  const stats = await prisma.inspection.groupBy({
    by: ['status'],
    where: { userId: session.user.id },
    _count: true,
  });

  const totalDrafts = stats.find((s) => s.status === 'DRAFT')?._count ?? 0;
  const totalSubmitted =
    stats.find((s) => s.status === 'SUBMITTED')?._count ?? 0;
  const totalInspections = totalDrafts + totalSubmitted;

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header - Mobile Optimized */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Nome */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-900 truncate">
                BRK Checklist
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {session.user.name}
              </p>
            </div>
            {/* Botão Sair */}
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="sm" className="ml-2">
                <span className="hidden sm:inline">Sair</span>
                <span className="sm:hidden">🚪</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Admin Panel - Only for ADMIN users */}
        {session.user.role === 'ADMIN' && (
          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <span>👑</span>
                <span>Painel de Administração</span>
              </CardTitle>
              <CardDescription>
                Ferramentas administrativas e gestão do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <span className="mr-2">👥</span>
                    Gerenciar Usuários
                  </Button>
                </Link>
                <Link href="/admin/inspections">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <span className="mr-2">📋</span>
                    Todas as Inspeções
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <span className="mr-2">📊</span>
                    Relatórios e Métricas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* OneDrive Status Alert */}
        {params.onedrive_connected === 'true' && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
            <p className="font-medium">✅ OneDrive conectado com sucesso!</p>
            <p className="text-sm mt-1">
              Agora você pode fazer upload de imagens para suas inspeções.
            </p>
          </div>
        )}
        {params.onedrive_error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
            <p className="font-medium">❌ Erro ao conectar OneDrive</p>
            <p className="text-sm mt-1">
              Erro: {decodeURIComponent(params.onedrive_error)}
            </p>
          </div>
        )}

        {/* OneDrive Connection Card */}
        <OneDriveAlert isConnected={isOneDriveConnected} />

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Total */}
          <Card className="card-mobile">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Inspeções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                {totalInspections}
              </p>
            </CardContent>
          </Card>

          {/* Rascunhos */}
          <Card className="card-mobile">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                {totalDrafts}
              </p>
            </CardContent>
          </Card>

          {/* Enviadas */}
          <Card className="card-mobile">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {totalSubmitted}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile Touch-Friendly */}
        <div className="sticky bottom-4 z-40">
          <Link href="/inspection/new">
            <Button size="lg" className="btn-mobile w-full shadow-lg">
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nova Inspeção
            </Button>
          </Link>
        </div>

        {/* Recent Inspections */}
        <Card>
          <CardHeader>
            <CardTitle>Inspeções Recentes</CardTitle>
            <CardDescription>
              Suas últimas 5 inspeções cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inspections.length === 0 ? (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Nenhuma inspeção ainda
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Comece criando sua primeira inspeção de segurança.
                </p>
                <div className="mt-6">
                  <Link href="/inspection/new">
                    <Button>Criar Primeira Inspeção</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {inspections.map((inspection) => (
                  <div key={inspection.id} className="relative">
                    <Link
                      href={`/inspection/${inspection.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 pr-16">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-blue-600">
                              #{inspection.number}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                inspection.status === 'DRAFT'
                                  ? 'bg-amber-100 text-amber-800'
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
                          {inspection.title && (
                            <p className="mt-1 text-sm text-gray-900">
                              {inspection.title}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Criada em {formatDateTime(inspection.createdAt)}
                            </span>
                            {inspection.location && (
                              <>
                                <span>•</span>
                                <span>{inspection.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                  
                  {/* Botão de excluir (apenas para rascunhos) */}
                  {inspection.status === 'DRAFT' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <DeleteDraftButton
                        inspectionId={inspection.id}
                        inspectionNumber={inspection.number}
                      />
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}

            {inspections.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/inspections">
                  <Button variant="outline">Ver Todas as Inspeções</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
