import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const session = await auth();

  // Se já está autenticado, redireciona
  if (session?.user) {
    if (session.user.role === 'PENDING') {
      redirect('/pending-approval');
    }
    // Todos os usuários aprovados vão para /dashboard
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">BRK Checklist</h1>
          <p className="mt-2 text-gray-600">
            Sistema de Inspeção de Segurança do Trabalho
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
