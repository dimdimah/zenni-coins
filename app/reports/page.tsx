"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatting";
import { Transaction } from "@/lib/types";
import { exportPDFClient } from "@/lib/utils/exportPDF";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type ExportFormat = "excel" | "pdf-client" | "pdf-server";

const FORMAT_OPTIONS: { key: ExportFormat; labelShort: string; labelLong: string }[] = [
  { key: "excel",      labelShort: "Excel",   labelLong: "Excel"   },
  { key: "pdf-client", labelShort: "PDF ⚡",  labelLong: "PDF cepat" },
  { key: "pdf-server", labelShort: "PDF ☁️",  labelLong: "PDF server"      },
];

export default function ReportsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("excel");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data?.user) router.push("/auth/login");
        else setIsAuthenticated(true);
      } catch {
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const selectedMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const { data: transactions, isLoading: txLoading } = useSWR<Transaction[]>(
    isAuthenticated ? `/api/transactions?month=${selectedMonth}` : null,
    fetcher,
  );

  const handleExport = async () => {
    // ── PDF client-side — generate di browser, no server call ──
    if (exportFormat === "pdf-client") {
      if (!transactions || transactions.length === 0) {
        return toast({
          title: "Tidak ada data",
          description: "Belum ada transaksi bulan ini",
          variant: "destructive",
        });
      }
      exportPDFClient(transactions, selectedMonth, monthLabel);
      toast({ title: "Berhasil! 🎉", description: "PDF diunduh langsung dari browser" });
      return;
    }

    // ── Excel & PDF server-side ──
    setIsExporting(true);
    try {
      const format = exportFormat === "pdf-server" ? "pdf-server" : "excel";
      const ext    = exportFormat === "pdf-server" ? "pdf" : "xlsx";
      const response = await fetch(
        `/api/reports/export?format=${format}&month=${selectedMonth}`,
      );
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `laporan-keuangan-${selectedMonth}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Berhasil! 🎉",
        description: `Laporan diunduh sebagai ${ext.toUpperCase()}`,
      });
    } catch {
      toast({ title: "Gagal mengunduh", description: "Coba lagi ya!", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  let totalIncome = 0;
  let totalExpense = 0;
  transactions?.forEach((tx) => {
    const amount = parseFloat(tx.amount as unknown as string);
    if (tx.type === "income") totalIncome += amount;
    else totalExpense += amount;
  });
  const balance = totalIncome - totalExpense;
  const isSurplus = balance >= 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-amber-700 text-sm font-medium">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-amber-50">
      <div
        className="px-5 pt-7 pb-8 md:rounded-b-3xl"
        style={{ background: "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Title row + desktop export */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-gray-900 text-xl font-extrabold tracking-tight">
                Laporan Keuangan
              </h1>
              <p className="text-amber-800/60 text-xs mt-0.5">Analisis keuangan bulanan</p>
            </div>

            {/* Desktop export */}
            <div className="hidden md:flex items-center gap-2">
              {/* Format toggle pill */}
              <div className="flex rounded-xl overflow-hidden border border-white/40 bg-white/20">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.key}
                    onClick={() => setExportFormat(fmt.key)}
                    title={fmt.labelLong}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${
                      exportFormat === fmt.key
                        ? "bg-gray-900 text-white"
                        : "text-gray-800 hover:bg-white/30"
                    }`}
                  >
                    {fmt.labelShort}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                {isExporting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Download className="w-3.5 h-3.5" />}
                Unduh
              </button>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-900" />
            </button>
            <span className="text-gray-900 font-bold text-sm">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-900" />
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-3.5">
              <p className="text-amber-900/60 text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                Pemasukan
              </p>
              <p className="text-gray-900 text-xl font-extrabold leading-tight">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-amber-900/50 text-[10px] mt-1">
                {transactions?.filter((t) => t.type === "income").length || 0} transaksi
              </p>
            </div>

            <div className="glass rounded-2xl p-3.5">
              <p className="text-amber-900/60 text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                Pengeluaran
              </p>
              <p className="text-gray-900 text-xl font-extrabold leading-tight">
                {formatCurrency(totalExpense)}
              </p>
              <p className="text-amber-900/50 text-[10px] mt-1">
                {transactions?.filter((t) => t.type === "expense").length || 0} transaksi
              </p>
            </div>

            <div className="col-span-2 md:col-span-1 glass rounded-2xl p-3.5 flex items-center justify-between md:block">
              <div>
                <p className="text-amber-900/60 text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                  Saldo
                </p>
                <p className={`text-xl font-extrabold leading-tight ${isSurplus ? "text-amber-600" : "text-red-600"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mt-1 inline-block ${
                isSurplus ? "bg-amber-500/20 text-amber-700" : "bg-red-500/20 text-red-700"
              }`}>
                {isSurplus ? "Surplus" : "Defisit"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-52 md:pb-10 space-y-4">
        {txLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="glass rounded-2xl shadow-lg overflow-hidden">

            {/* Card header */}
            <div className="px-4 py-3.5 border-b border-white/20 bg-white/10 flex items-center justify-between">
              <span className="text-amber-900 font-bold text-sm">
                Riwayat Transaksi — {monthLabel}
              </span>
              <span className="text-amber-700 text-xs font-semibold bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                {transactions.length} transaksi
              </span>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-white/20 md:hidden">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.type === "income" ? "bg-emerald-100" : "bg-amber-100"
                  }`}>
                    {tx.type === "income"
                      ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                      : <TrendingDown className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-900 font-semibold text-sm truncate">
                      {(tx as any).category?.name || "Unknown"}
                    </p>
                    <p className="text-amber-700/60 text-xs mt-0.5">
                      {new Date(tx.date).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className={`text-sm font-bold shrink-0 ${
                    tx.type === "income" ? "text-emerald-600" : "text-gray-800"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/10">
                    <th className="text-left py-3 px-4 text-xs font-bold text-amber-900/70">Tanggal</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-amber-900/70">Kategori</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-amber-900/70">Tipe</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-amber-900/70">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/10 transition-colors">
                      <td className="py-3.5 px-4 text-amber-700/60 text-xs">
                        {new Date(tx.date).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-amber-900 font-semibold text-xs">
                        {(tx as any).category?.name || "Unknown"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {tx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold text-xs ${
                        tx.type === "income" ? "text-emerald-600" : "text-gray-800"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-amber-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-gray-800 font-bold text-sm mb-1">Belum ada data nih</p>
            <p className="text-gray-400 text-xs">Belum ada transaksi di bulan {monthLabel}</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE EXPORT BAR
      ══════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-40">
        <div className="bg-white/90 backdrop-blur-md border-t border-amber-100 px-4 pt-3 pb-3 shadow-[0_-4px_24px_rgba(245,166,35,0.12)]">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2.5 text-center">
            Ekspor Laporan
          </p>
          <div className="flex gap-2">
            {/* Format toggle */}
            <div className="flex rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt.key}
                  onClick={() => setExportFormat(fmt.key)}
                  title={fmt.labelLong}
                  className={`px-3 py-2.5 text-xs font-bold transition-colors ${
                    exportFormat === fmt.key
                      ? "bg-amber-400 text-gray-900"
                      : "text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {fmt.labelShort}
                </button>
              ))}
            </div>

            {/* Download button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              {isExporting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              Unduh
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
