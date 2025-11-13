'use client';

/**
 * Global Error Boundary for Next.js App Router
 * Handles errors at the root layout level
 */
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-xl">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Erro Crítico
              </h1>
              <p className="text-sm text-slate-600">
                Ocorreu um erro inesperado no sistema.
              </p>
            </div>

            {error.digest && (
              <div className="rounded-md bg-slate-100 p-3">
                <p className="text-xs font-mono text-slate-700">
                  ID: {error.digest}
                </p>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Tentar Novamente
            </button>

            <a
              href="/dashboard"
              className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
