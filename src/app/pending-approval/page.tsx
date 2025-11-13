import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Força renderização dinâmica
export const dynamic = 'force-dynamic';

export default async function PendingApprovalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'PENDING') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-10 w-10 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Aguardando Aprovação
          </h1>
        </div>

        <div className="space-y-4 text-center text-gray-600">
          <p>
            Olá, <strong>{session.user.name}</strong>!
          </p>
          <p>
            Seu acesso foi solicitado com sucesso e está aguardando aprovação
            do administrador.
          </p>
          <p className="text-sm">
            Você receberá uma notificação quando seu acesso for liberado.
          </p>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">📧 Email cadastrado:</p>
          <p className="mt-1">{session.user.email}</p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Sair
          </Link>
        </div>
      </div>
    </div>
  );
}
