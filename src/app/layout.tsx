import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDV Mercado Profissional",
  description: "Sistema PDV profissional online para mercado"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
