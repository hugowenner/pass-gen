import PasswordViewer from "@/components/PasswordViewer";

interface ViewPageProps {
  params: Promise<{ token: string }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { token } = await params;

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-[-10%] -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/25 via-transparent to-transparent blur-3xl" />

      <div className="w-full max-w-md">
        <header className="mb-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-2xl shadow-lg shadow-black/30">
            🔐
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Password Secure
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Acesso temporário e seguro — este link expira em 24 horas.
          </p>
        </header>

        <PasswordViewer token={token} />
      </div>
    </main>
  );
}
