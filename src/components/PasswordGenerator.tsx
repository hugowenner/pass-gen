"use client";

import { useState } from "react";
import { generatePassword, calculatePasswordStrength, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { copyClipboard } from "@/lib/crypto";
import ShareModal from "@/components/ShareModal";
import Toast, { ToastState } from "@/components/Toast";

const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-emerald-500",
];

export default function PasswordGenerator() {
  const [empresa, setEmpresa] = useState("");
  const [length, setLength] = useState(16);
  const [quantity, setQuantity] = useState(1);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [symbolsCharset, setSymbolsCharset] = useState("!@#$%&*+-_=?");

  const [passwords, setPasswords] = useState<string[]>([]);
  const [shareTarget, setShareTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  function notify(kind: ToastState["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 2600);
  }

  function handleGenerate() {
    try {
      const results: string[] = [];
      const count = Math.min(Math.max(quantity, 1), 20);
      for (let i = 0; i < count; i++) {
        results.push(
          generatePassword({
            length,
            uppercase,
            lowercase,
            numbers,
            symbols,
            symbolsCharset,
          })
        );
      }
      setPasswords(results);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Erro ao gerar senha.");
    }
  }

  async function handleCopy(password: string) {
    const ok = await copyClipboard(password);
    notify(ok ? "success" : "error", ok ? "Senha copiada!" : "Não foi possível copiar.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Gerador de senha</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Empresa</label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ex: Tripla"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Tamanho</label>
              <input
                type="number"
                min={MIN_PASSWORD_LENGTH}
                max={MAX_PASSWORD_LENGTH}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Quantidade</label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"
            />
            Maiúsculas
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"
            />
            Minúsculas
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"
            />
            Números
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"
            />
            Especiais
          </label>
        </div>

        {symbols && (
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Caracteres especiais
            </label>
            <input
              type="text"
              value={symbolsCharset}
              onChange={(e) => setSymbolsCharset(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 font-mono text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="mt-5 w-full rounded-xl bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-500 sm:w-auto sm:px-6"
        >
          Gerar senha
        </button>
      </div>

      {passwords.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {passwords.map((password, index) => {
            const strength = calculatePasswordStrength(password);
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <code className="break-all font-mono text-lg text-brand-300">{password}</code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(password)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                    >
                      Copiar
                    </button>
                    <button
                      onClick={() => setShareTarget(password)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-500"
                    >
                      🔐 Criar Link Seguro
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${STRENGTH_COLORS[strength.score]}`}
                      style={{ width: `${((strength.score + 1) / 5) * 100}%` }}
                    />
                  </div>
                  <span className="mt-1 block text-xs text-slate-400">{strength.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shareTarget && (
        <ShareModal senha={shareTarget} empresa={empresa} onClose={() => setShareTarget(null)} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
