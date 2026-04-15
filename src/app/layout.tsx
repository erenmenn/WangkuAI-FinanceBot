import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "WangkuAI — Asisten Keuangan Pribadi",
  description: "Asisten keuangan berbasis AI yang memahami bahasa sehari-hari. Catat pemasukan, pengeluaran, dan pantau saldo secara real-time.",
  icons: {
    icon: '/img/robot-cat.png',
  },
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
