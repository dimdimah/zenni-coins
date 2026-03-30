import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/shared/Navbar";
import BottomNav  from "@/components/shared/BottonNav";
import { TransactionFormProvider } from "@/lib/context/transaction-form-context";
import { GlobalTransactionForm } from "@/components/GlobalTransactionForm";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFlow - Manajemen Keuangan Pribadi",
  description:
    "Aplikasi manajemen keuangan pribadi yang mudah dan intuitif dengan fitur tracking, budgeting, dan laporan keuangan",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png",  media: "(prefers-color-scheme: dark)" },
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
      <body className="font-sans antialiased bg-background" suppressHydrationWarning>
       

          <Navbar />

          <main className="pb-16 md:pb-0">
            {children}
          </main>

          {/* <BottomNav />
          <GlobalTransactionForm /> */}

          <Analytics />
       
      </body>
    </html>
  );
}