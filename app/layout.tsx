import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFlow - Manajemen Keuangan & Testing Platform",
  description:
    "Aplikasi manajemen keuangan pribadi dan platform testing dengan fitur tracking, budgeting, laporan keuangan, serta pembuatan dan grading tes secara real-time",
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
    <html lang="id">
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
