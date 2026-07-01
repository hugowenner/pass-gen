"use client";

import { useEffect, useState } from "react";
import { copyClipboard, revealSharedPassword } from "@/lib/crypto";
import Toast, { ToastState } from "@/components/Toast";

interface PasswordViewerProps {
  token: string;
}

type ViewState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "expired"; empresa: string }
  | { status: "ready"; empresa: string; senha: string };

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

export default function PasswordViewer({ token }: PasswordViewerProps) {
  const [state, setState] = useState<ViewState>({ status: "loading" });
  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function notify(kind: ToastState["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    revealSharedPassword(token)
      .then((result) => {
        if (result.expired) {
          setState({ status: "expired", empresa: result.empresa });
        } else {
          setState({ status: "ready", empresa: result.empresa, senha: result.senha });
        }
      })
      .catch(() => setState({ status: "invalid" }));
  }, [token]);

  function handleReveal() {
    setRevealing(true);
    setTimeout(() => {
      setRevealed(true);
      setRevealing(false);
    }, 350);
  }

  async function handleCopy(senha: string) {
    const ok = await copyClipboard(senha);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      notify("error", "Não foi possível copiar.");
    }
  }

  if (state.status === "loading") {
    return (
      <div className="mx-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 text-center text-sm text-slate-400 shadow-xl shadow-black/20 backdrop-blur-xl">
        Carregando...
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className="animate-fade-in mx-auto rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-sm text-red-300 shadow-xl shadow-black/20">
        Link inválido ou corrompido.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="animate-fade-in rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-100">
          <span className="text-xl">🔒</span> Senha protegida
        </h2>

        <dl className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm">
          <dt className="text-slate-500">Empresa</dt>
          <dd className="font-medium text-slate-100">{state.empresa}</dd>
        </dl>

        {state.status === "expired" ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <span>⏱️</span> Este link expirou.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {revealed ? "Senha revelada" : "Senha"}
              </label>
              <code className="block break-all rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 font-mono text-lg tracking-wide text-brand-300 shadow-inner shadow-black/30">
                {revealed ? state.senha : "█".repeat(Math.max(state.senha.length, 10))}
              </code>
            </div>

            {!revealed ? (
              <button
                onClick={handleReveal}
                disabled={revealing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 hover:shadow-brand-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {revealing && <Spinner />}
                👁 Mostrar senha
              </button>
            ) : (
              <button
                onClick={() => handleCopy(state.senha)}
                className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 hover:shadow-brand-500/30 active:scale-[0.99]"
              >
                {copied ? "✓ Senha copiada" : "Copiar senha"}
              </button>
            )}
          </div>
        )}
      </section>

      <Toast toast={toast} />
    </div>
  );
}
