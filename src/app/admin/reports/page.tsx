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

export default async function AdminReportsPage() {
  await requireAdmin();

  // Estatísticas gerais
  const [
    totalUsers,
    totalInspections,
    totalImages,
    recentInspections,
    topUsers,
  ] = await Promise.all([
    // Total de usuários
    prisma.user.count(),

    // Total de inspeções
    prisma.inspection.count(),

    // Total de imagens
    prisma.inspectionImage.count(),

    // Inspeções dos últimos 30 dias
    prisma.inspection.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Top 10 usuários por número de inspeções
    prisma.user.findMany({
      select: {
        name: true,
        email: true,
        _count: {
          select: {
            inspections: true,
          },
        },
      },
      orderBy: {
        inspections: {
          _count: 'desc',
        },
      },
      take: 10,
    }),
  ]);

  // Estatísticas por status
  const inspectionsByStatus = await prisma.inspection.groupBy({
    by: ['status'],
    _count: true,
  });


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                📊 Relatórios e Métricas
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Análise detalhada do uso do sistema
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">← Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Inspeções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {totalInspections}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {recentInspections} nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {totalImages}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Imagens armazenadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Média por Inspeção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                {totalInspections > 0
                  ? (totalImages / totalInspections).toFixed(1)
                  : '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">imagens por inspeção</p>
            </CardContent>
          </Card>
        </div>

        {/* Inspections by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inspeções por Status</CardTitle>
            <CardDescription>Distribuição de inspeções por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inspectionsByStatus.map((stat) => (
                <div
                  key={stat.status}
                  className="p-4 border rounded-lg text-center"
                >
                  <p className="text-sm text-gray-600 mb-2">
                    {stat.status === 'DRAFT'
                      ? '📝 Rascunhos'
                      : stat.status === 'SUBMITTED'
                        ? '✅ Enviadas'
                        : '📦 Arquivadas'}
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {stat._count}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalInspections > 0
                      ? `${((stat._count / totalInspections) * 100).toFixed(1)}%`
                      : '0%'}{' '}
                    do total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Usuários Mais Ativos</CardTitle>
            <CardDescription>
              Usuários com maior número de inspeções criadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : index === 1
                            ? 'bg-gray-100 text-gray-800'
                            : index === 2
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {user._count.inspections}
                    </p>
                    <p className="text-xs text-gray-500">inspeções</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Saúde do Sistema</CardTitle>
            <CardDescription>Métricas de integração e conectividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Taxa de Conclusão de Inspeções
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {totalInspections > 0
                        ? `${(
                            ((inspectionsByStatus.find((s) => s.status === 'SUBMITTED')?._count ?? 0) /
                              totalInspections) *
                            100
                          ).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="text-5xl">✓</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Inspeções enviadas vs. total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
