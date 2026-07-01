"use client";

import { useEffect, useState } from "react";
import {
  EXPIRATION_MS,
  copyClipboard,
  formatDateTime,
  formatRemaining,
  revealSharedPassword,
} from "@/lib/crypto";
import Toast, { ToastState } from "@/components/Toast";

interface PasswordViewerProps {
  token: string;
}

type ViewState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "expired"; empresa: string }
  | {
      status: "ready";
      empresa: string;
      identificacao: string;
      senha: string;
      createdAt: number;
    };

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
  const [now, setNow] = useState(() => Date.now());
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
          setState({
            status: "ready",
            empresa: result.empresa,
            identificacao: result.identificacao,
            senha: result.senha,
            createdAt: result.createdAt,
          });
        }
      })
      .catch(() => setState({ status: "invalid" }));
  }, [token]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [state.status]);

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

        <div className="mb-6 space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Empresa</span>
            <span className="font-medium text-slate-100">{state.empresa}</span>
          </div>
          {state.status === "ready" && state.identificacao && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Identificação</span>
              <span className="font-medium text-slate-100">{state.identificacao}</span>
            </div>
          )}
        </div>

        {state.status === "expired" ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <span>⏱️</span> Este link expirou.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Senha
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
                {copied ? "✓ Senha copiada" : "Copiar"}
              </button>
            )}

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-xs">
              <div>
                <span className="block text-slate-500">⏳ Expira em</span>
                <span className="font-medium text-slate-200">
                  {formatRemaining(EXPIRATION_MS - (now - state.createdAt))}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-slate-500">Criado em</span>
                <span className="font-medium text-slate-200">
                  {formatDateTime(state.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      <Toast toast={toast} />
    </div>
  );
}
