"use client";

import { useState } from "react";
import { copyClipboard, createSecurePayload, encryptPayload, generateKey } from "@/lib/crypto";
import QRCode from "@/components/QRCode";
import Toast, { ToastState } from "@/components/Toast";

interface ShareModalProps {
  senha: string;
  empresa: string;
  onClose: () => void;
}

export default function ShareModal({ senha, empresa, onClose }: ShareModalProps) {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [autoKey, setAutoKey] = useState<string>(() => generateKey());
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  function notify(kind: ToastState["kind"], message: string) {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 2600);
  }

  function regenerateAutoKey() {
    setAutoKey(generateKey());
  }

  async function handleCopyKey() {
    const ok = await copyClipboard(autoKey);
    notify(ok ? "success" : "error", ok ? "Chave copiada!" : "Não foi possível copiar a chave.");
  }

  async function handleCreateLink() {
    setFormError(null);

    const effectivePassphrase = autoGenerate ? autoKey : passphrase;

    if (!autoGenerate) {
      if (passphrase.length < 6) {
        setFormError("A chave de proteção deve ter ao menos 6 caracteres.");
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setFormError("As chaves de proteção não coincidem.");
        return;
      }
    }

    setLoading(true);
    try {
      const meta = createSecurePayload(empresa || "Sem nome");
      const token = await encryptPayload(senha, meta, effectivePassphrase);
      const url = `${window.location.origin}/view#${token}`;
      setLink(url);
    } catch {
      notify("error", "Erro ao criptografar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!link) return;
    const ok = await copyClipboard(link);
    notify(ok ? "success" : "error", ok ? "Link copiado!" : "Não foi possível copiar o link.");
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">🔐 Criar Link Seguro</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {!link ? (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"
              />
              Gerar chave automaticamente
            </label>

            {autoGenerate ? (
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Chave automática</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2">
                  <code className="flex-1 font-mono text-base tracking-wide text-brand-300">
                    {autoKey}
                  </code>
                  <button
                    onClick={regenerateAutoKey}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
                    title="Gerar nova chave"
                    aria-label="Gerar nova chave"
                  >
                    🔄
                  </button>
                </div>
                <button
                  onClick={handleCopyKey}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Copiar chave
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Senha de proteção
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Confirmar
                  </label>
                  <input
                    type="password"
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Criptografando..." : "Criar link"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-300">Link criado</span>
              <div className="break-all rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 font-mono text-xs text-brand-300">
                {link}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
              >
                Copiar link
              </button>
              <button
                onClick={() => setShowQr((v) => !v)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              >
                {showQr ? "Ocultar QR" : "Gerar QR Code"}
              </button>
            </div>

            {showQr && <QRCode value={link} />}

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              ⚠️ Guarde a chave de proteção. Sem ela não será possível visualizar a senha.
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-700 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Fechar
            </button>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
