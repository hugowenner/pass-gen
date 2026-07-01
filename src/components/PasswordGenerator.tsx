"use client";

import { useState } from "react";
import { generatePassword, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { copyClipboard, createShareLink } from "@/lib/crypto";
import Toast, { ToastState } from "@/components/Toast";

const DEFAULT_SYMBOLS = "!@#$%&*+-_=?";

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

export default function PasswordGenerator() {
  const [empresa, setEmpresa] = useState("");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const [senha, setSenha] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedField, setCopiedField] = useState<"senha" | "link" | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  function notify(kind: ToastState["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 2600);
  }

  function handleGenerate() {
    try {
      const password = generatePassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        symbolsCharset: DEFAULT_SYMBOLS,
      });
      setSenha(password);
      setRevealed(false);
      setLink(null);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Erro ao gerar senha.");
    }
  }

  async function handleCreateLink() {
    if (!senha) return;
    setCreatingLink(true);
    try {
      const token = await createShareLink(empresa, senha);
      setLink(`${window.location.origin}/view/${token}`);
    } catch {
      notify("error", "Erro ao criar o link. Tente novamente.");
    } finally {
      setCreatingLink(false);
    }
  }

  async function handleCopy(field: "senha" | "link", value: string) {
    const ok = await copyClipboard(value);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } else {
      notify("error", "Não foi possível copiar.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Gerador de senha
        </h2>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Empresa
            </label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Digite o nome da empresa"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Tamanho da senha
            </label>
            <input
              type="number"
              min={MIN_PASSWORD_LENGTH}
              max={MAX_PASSWORD_LENGTH}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-300 transition hover:border-slate-700">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-brand-500"
              />
              Maiúsculas
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-300 transition hover:border-slate-700">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-brand-500"
              />
              Minúsculas
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-300 transition hover:border-slate-700">
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => setNumbers(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-brand-500"
              />
              Números
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-300 transition hover:border-slate-700">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-brand-500"
              />
              Especiais
            </label>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 hover:shadow-brand-500/30 active:scale-[0.99]"
          >
            Gerar Senha
          </button>
        </div>
      </section>

      {senha && (
        <section className="animate-fade-in space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Senha gerada
          </h2>

          <code className="block break-all rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 font-mono text-lg tracking-wide text-brand-300 shadow-inner shadow-black/30">
            {revealed ? senha : "•".repeat(Math.max(senha.length, 12))}
          </code>

          <div className="flex gap-2.5">
            <button
              onClick={() => setRevealed((v) => !v)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 active:scale-[0.99]"
            >
              {revealed ? "🙈 Ocultar" : "👁 Mostrar"}
            </button>
            <button
              onClick={() => handleCopy("senha", senha)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 active:scale-[0.99]"
            >
              {copiedField === "senha" ? "✓ Copiado" : "Copiar"}
            </button>
          </div>

          <button
            onClick={handleCreateLink}
            disabled={creatingLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 hover:shadow-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingLink && <Spinner />}
            {creatingLink ? "Criptografando..." : "Criar Link Seguro"}
          </button>
        </section>
      )}

      {link && (
        <section className="animate-fade-in space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Link criado
          </h2>

          <div className="break-all rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 font-mono text-xs text-brand-300 shadow-inner shadow-black/30">
            {link}
          </div>

          <button
            onClick={() => handleCopy("link", link)}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 hover:shadow-brand-500/30 active:scale-[0.99]"
          >
            {copiedField === "link" ? "✓ Link copiado" : "Copiar Link"}
          </button>

          <p className="text-center text-xs text-slate-500">Este link expira em 24 horas.</p>
        </section>
      )}

      <Toast toast={toast} />
    </div>
  );
}
