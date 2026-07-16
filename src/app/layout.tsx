import type { Metadata } from "next";
import { Nunito, Fraunces } from "next/font/google";

import "./globals.css";
import { AppShell } from "@/components/app-shell";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LunarLogic — Vanguard Holdings Group",
  description:
    "LunarLogic demo environment for Vanguard Holdings Group — treasury, cash flow forecasting, month-end close, and covenant monitoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable} dark`}>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
