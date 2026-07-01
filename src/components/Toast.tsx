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
      ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-300"
      : "border-red-500/30 bg-red-950/80 text-red-300";

  return (
    <div
      className={`animate-fade-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-xl shadow-black/30 backdrop-blur-xl ${styles}`}
      role="status"
    >
      {toast.kind === "success" ? "✓ " : "⚠ "}
      {toast.message}
    </div>
  );
}
