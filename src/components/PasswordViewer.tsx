"use client";

import { useEffect, useState } from "react";
import { copyClipboard, decryptPayload, readShareMetadata, ShareMetadata } from "@/lib/crypto";
import QRCode from "@/components/QRCode";
import Toast, { ToastState } from "@/components/Toast";

export default function PasswordViewer() {
  const [token, setToken] = useState<string | null>(null);
  const [meta, setMeta] = useState<ShareMetadata | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [passphrase, setPassphrase] = useState("");
  const [senha, setSenha] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function notify(kind: ToastState["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const hash = window.location.hash;
    const extracted = hash.startsWith("#") ? hash.slice(1) : hash;

    if (!extracted) {
      setLinkError("Nenhum link seguro foi encontrado nesta URL.");
      return;
    }

    setToken(extracted);

    try {
      setMeta(readShareMetadata(extracted));
    } catch {
      setLinkError("Link inválido ou corrompido.");
    }
  }, []);

  async function handleReveal() {
    if (!token) return;
    setRevealError(null);
    setLoading(true);
    try {
      const plaintext = await decryptPayload(token, passphrase);
      setSenha(plaintext);
    } catch (err) {
      setRevealError(err instanceof Error ? err.message : "Não foi possível revelar a senha.");
    } finally {
      setLoading(false);
      // A chave de proteção só existe em memória local, nunca é persistida.
      setPassphrase("");
    }
  }

  async function handleCopySenha() {
    if (!senha) return;
    const ok = await copyClipboard(senha);
    notify(ok ? "success" : "error", ok ? "Senha copiada!" : "Não foi possível copiar.");
  }

  function handleClearSenha() {
    setSenha(null);
    setShowQr(false);
  }

  if (linkError) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300 animate-fade-in">
        {linkError}
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2 text-slate-100">
          <span className="text-xl">🔒</span>
          <h2 className="text-lg font-semibold">Senha protegida</h2>
        </div>

        <dl className="mb-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Empresa</dt>
            <dd className="font-medium text-slate-200">{meta.empresa}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Criada</dt>
            <dd className="font-medium text-slate-200">
              {meta.data} às {meta.hora}
            </dd>
          </div>
        </dl>

        {!senha ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Digite a chave
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="********"
                onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {revealError && <p className="text-sm text-red-400">{revealError}</p>}

            <button
              onClick={handleReveal}
              disabled={loading || passphrase.length === 0}
              className="w-full rounded-xl bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Descriptografando..." : "Revelar senha"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-300">Senha</span>
              <code className="block break-all rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 font-mono text-lg text-brand-300">
                {senha}
              </code>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopySenha}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
              >
                Copiar senha
              </button>
              <button
                onClick={() => setShowQr((v) => !v)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              >
                {showQr ? "Ocultar QR" : "Gerar QR Code"}
              </button>
            </div>

            {showQr && <QRCode value={window.location.href} />}

            <button
              onClick={handleClearSenha}
              className="w-full rounded-xl border border-slate-700 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
            >
              Limpar da tela
            </button>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
