"use client";

export type ToastKind = "success" | "error";

export interface ToastState {
  kind: ToastKind;
  message: string;
}

interface ToastProps {
  toast: ToastState | null;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  const styles =
    toast.kind === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : "border-red-500/40 bg-red-500/10 text-red-300";

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur animate-fade-in ${styles}`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
