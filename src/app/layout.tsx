import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Password Secure Generator",
  description:
    "Gere e compartilhe senhas com criptografia de ponta a ponta, sem banco de dados e sem servidor de armazenamento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
