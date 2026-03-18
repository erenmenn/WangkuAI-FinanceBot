import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MinoAI — Asisten Keuangan Pribadi",
  description: "Asisten keuangan berbasis AI yang memahami bahasa sehari-hari. Catat pemasukan, pengeluaran, dan pantau saldo secara real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
