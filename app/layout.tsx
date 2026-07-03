import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";

import { BrowserConsoleBranding } from "@/shared/components/layout/browser-console-branding";
import { QueryProvider } from "@/shared/components/providers/query-provider";
import { Toaster } from "@/shared/components/ui/sonner";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlightraX",
  description: "Flight operations command center",
  icons: {
    icon: "/logo/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <BrowserConsoleBranding />
        <Toaster closeButton position="top-right" richColors />
      </body>
    </html>
  );
}
