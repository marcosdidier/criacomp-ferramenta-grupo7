import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O bestiário do Samuel",
  description: "Desenhe um bicho, conte como ele é e veja ele ganhar vida.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
