import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// Força renderização dinâmica
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redireciona baseado no role
  if (session.user.role === 'PENDING') {
    redirect('/pending-approval');
  }

  // Todos os usuários aprovados (ADMIN, OPERATOR, VIEWER) vão para /dashboard
  redirect('/dashboard');
}
