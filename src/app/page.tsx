import PasswordGenerator from "@/components/PasswordGenerator";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
          🔑 Password Secure Generator
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Gere senhas fortes e compartilhe com criptografia de ponta a ponta. Nada é enviado ao
          servidor — tudo acontece no seu navegador.
        </p>
      </header>

      <PasswordGenerator />
    </main>
  );
}
