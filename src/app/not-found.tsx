import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            erro 404
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Não encontramos a página que você estava buscando
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Verifique se o endereço está correto ou utilize os botões abaixo para voltar a uma área segura do sistema.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Ir para o dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
