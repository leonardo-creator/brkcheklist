import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { UserRole } from '@prisma/client';

/**
 * Hook para obter a sessão do usuário autenticado
 * Redireciona para login se não estiver autenticado
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * Verifica se o usuário tem uma das roles permitidas
 * Redireciona para página de acesso negado se não tiver permissão
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Apenas para admins
 */
export async function requireAdmin() {
  return requireRole(['ADMIN']);
}

/**
 * Para usuários aprovados (USER ou ADMIN)
 */
export async function requireApprovedUser() {
  return requireRole(['USER', 'ADMIN']);
}

/**
 * Verifica se o usuário é admin
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

/**
 * Verifica se o usuário está aprovado
 */
export async function isApproved() {
  const session = await auth();
  return session?.user?.role === 'USER' || session?.user?.role === 'ADMIN';
}
