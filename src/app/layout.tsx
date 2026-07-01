import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Password Secure",
  description:
    "Gere e compartilhe senhas com criptografia de ponta a ponta, sem banco de dados e sem servidor de armazenamento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
