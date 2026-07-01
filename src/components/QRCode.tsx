"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
}

/**
 * Gera o QR Code inteiramente no navegador (biblioteca local, sem chamadas
 * a APIs externas). O QR Code contém o próprio link criptografado.
 */
export default function QRCode({ value }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: 200,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).catch(() => {
      setError("Não foi possível gerar o QR Code.");
    });
  }, [value]);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="flex justify-center rounded-xl bg-white p-3 shadow-inner shadow-black/10">
      <canvas ref={canvasRef} />
    </div>
  );
}
