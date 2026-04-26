import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FinFlow - Manajemen Keuangan Pribadi",
  description:
    "Aplikasi manajemen keuangan pribadi yang mudah dan intuitif dengan fitur tracking, budgeting, dan laporan keuangan",
  generator: "finflow v1.0.0",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geist.variable} ${geistMono.variable}`}>
      <body
        className="font-sans antialiased bg-background"
        suppressHydrationWarning
      >
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              success: "bg-emerald-500 text-white border-none",
              error: "bg-red-500 text-white border-none",
            },
          }}
        />
        <Navbar />

        <main className="pb-16 md:pb-0">{children}</main>

        <Analytics />
      </body>
    </html>
  );
}
