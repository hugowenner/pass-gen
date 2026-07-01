import PasswordViewer from "@/components/PasswordViewer";

export default function ViewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
          🔑 Password Secure Generator
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          O conteúdo é descriptografado localmente no seu navegador. O servidor nunca tem acesso à
          senha.
        </p>
      </header>

      <PasswordViewer />
    </main>
  );
}
