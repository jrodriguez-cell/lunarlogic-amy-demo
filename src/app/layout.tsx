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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunarlogic-amy-demo.vercel.app";
const DESCRIPTION =
  "Automated cash-flow forecasting, month-end close, and covenant monitoring — a live demo from LunarLogic.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LunarLogic — Finance Cockpit",
    template: "%s · LunarLogic",
  },
  description: DESCRIPTION,
  applicationName: "LunarLogic",
  openGraph: {
    title: "LunarLogic — Finance Cockpit",
    description: DESCRIPTION,
    siteName: "LunarLogic",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LunarLogic — Finance Cockpit",
    description: DESCRIPTION,
  },
  robots: { index: false, follow: false },
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
