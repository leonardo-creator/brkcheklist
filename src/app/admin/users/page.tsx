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

export default async function AdminUsersPage() {
  // Requer permissão de admin
  await requireAdmin();

  // Buscar todos os usuários
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
      approvedAt: true,
      approvedBy: true,
      rejectedAt: true,
      rejectedBy: true,
      rejectionReason: true,
      _count: {
        select: {
          inspections: true,
        },
      },
    },
  });

  const pendingUsers = users.filter(
    (u) => !u.approvedAt && !u.rejectedAt
  );
  const activeUsers = users.filter((u) => u.approvedAt);
  const rejectedUsers = users.filter((u) => u.rejectedAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                👑 Gerenciamento de Usuários
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Total: {users.length} usuários
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                ← Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendentes de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingUsers.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {activeUsers.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuários Rejeitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {rejectedUsers.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users Section */}
        {pendingUsers.length > 0 && (
          <Card className="border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⏳</span>
                Usuários Pendentes de Aprovação
              </CardTitle>
              <CardDescription>
                Usuários aguardando aprovação para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cadastrado em {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action="/api/admin/approve-user" method="POST">
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" size="sm" variant="default">
                          ✓ Aprovar
                        </Button>
                      </form>
                      <form action="/api/admin/reject-user" method="POST">
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          ✗ Rejeitar
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✓</span>
              Usuários Ativos
            </CardTitle>
            <CardDescription>
              Usuários aprovados e com acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.role === 'ADMIN' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          👑 ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>📋 {user._count.inspections} inspeções</span>
                      {user.lastLoginAt && (
                        <span>
                          Último acesso: {formatDateTime(user.lastLoginAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.role !== 'ADMIN' && (
                      <form action="/api/admin/toggle-role" method="POST">
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Promover a Admin
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rejected Users Section */}
        {rejectedUsers.length > 0 && (
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>✗</span>
                Usuários Rejeitados
              </CardTitle>
              <CardDescription>
                Usuários que tiveram o acesso negado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rejectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.rejectionReason && (
                      <p className="text-sm text-red-700 mt-2">
                        Motivo: {user.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
