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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

type ExportFormat = "excel" | "pdf-client" | "pdf-server";

// ===== DONUT CHART COMPONENT =====
function ExpenseDonutChart({ transactions }: { transactions: Transaction[] }) {
  const expenseOnly = transactions.filter((tx) => tx.type === "expense");

  if (!expenseOnly.length) return null;

  // Grup per kategori
  const grouped: Record<string, { name: string; color: string; total: number }> = {};
  expenseOnly.forEach((tx) => {
    const cat = (tx as any).category;
    const id = cat?.id ?? "unknown";
    if (!grouped[id]) {
      grouped[id] = {
        name: cat?.name ?? "Lainnya",
        color: cat?.color ?? "#94a3b8",
        total: 0,
      };
    }
    grouped[id].total += Number(tx.amount);
  });

  const data = Object.values(grouped).sort((a, b) => b.total - a.total);
  const totalExpense = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="bg-white border rounded-2xl p-5 mt-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">
        Breakdown Pengeluaran
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-6">

        {/* DONUT */}
        <div className="w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="85%"
                dataKey="total"
                strokeWidth={2}
                stroke="#f9fafb"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Total"]}
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="flex-1 w-full space-y-2.5">
          {data.map((item, i) => {
            const pct = totalExpense > 0
              ? Math.round((item.total / totalExpense) * 100)
              : 0;

            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs text-gray-700 flex-1 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 tabular-nums">{pct}%</p>
                <p className="text-xs font-semibold text-gray-900 tabular-nums w-28 text-right">
                  {formatCurrency(item.total)}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

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
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.push("/auth/login");
      else setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const selectedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const monthLabel = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const { data: transactions, isLoading: txLoading } = useSWR<Transaction[]>(
    isAuthenticated ? `/api/transactions?month=${selectedMonth}` : null,
    fetcher
  );

  let totalIncome = 0;
  let totalExpense = 0;

  transactions?.forEach((tx) => {
    const amount = Number(tx.amount);
    if (tx.type === "income") totalIncome += amount;
    else totalExpense += amount;
  });

  const balance = totalIncome - totalExpense;
  const isSurplus = balance >= 0;

  const handleExport = async () => {
    if (exportFormat === "pdf-client") {
      if (!transactions?.length) {
        return toast({
          title: "Tidak ada data",
          description: "Belum ada transaksi",
          variant: "destructive",
        });
      }
      exportPDFClient(transactions, selectedMonth, monthLabel);
      return;
    }

    setIsExporting(true);
    try {
      const format = exportFormat === "pdf-server" ? "pdf-server" : "excel";
      const ext = exportFormat === "pdf-server" ? "pdf" : "xlsx";
      const res = await fetch(`/api/reports/export?format=${format}&month=${selectedMonth}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-${selectedMonth}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Laporan Keuangan
              </h1>
              <p className="text-gray-500 text-xs mt-1">Ringkasan transaksi bulanan</p>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-fit border border-gray-300">
              <button onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs font-semibold text-gray-700">{monthLabel}</span>
              <button onClick={nextMonth}>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* BALANCE */}
          <div className="mt-6 bg-white border rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
              {formatCurrency(balance)}
            </p>
            <span className={`inline-block mt-3 text-xs px-2.5 py-1 rounded-full font-medium
              ${isSurplus ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
              {isSurplus ? "↑ Surplus" : "↓ Defisit"}
            </span>
          </div>

          {/* MINI STATS */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Pemasukan</span>
              </div>
              <p className="text-sm font-semibold text-green-600 tabular-nums">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Pengeluaran</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 tabular-nums">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          {/* ===== DONUT CHART ===== */}
          {!txLoading && transactions && transactions.length > 0 && (
            <ExpenseDonutChart transactions={transactions} />
          )}

          {/* EXPORT */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {(["excel","pdf-client","pdf-server"] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`px-3 py-1.5 text-xs rounded-md transition font-medium
                  ${exportFormat === fmt
                    ? "bg-amber-400 text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {fmt}
              </button>
            ))}

            <button
              onClick={handleExport}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-400 text-black hover:bg-amber-300 transition active:scale-95"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
          </div>

        </div>
      </div>

      {/* LIST */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {txLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : transactions?.length ? (
          <div className="bg-white border rounded-2xl overflow-hidden">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${tx.type === "income"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                  }`}>
                  {tx.type === "income" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 ml-3 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {(tx as any).category?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.date).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <p className={`text-sm font-semibold tabular-nums shrink-0
                  ${tx.type === "income" ? "text-green-600" : "text-gray-900"}`}>
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <FileText className="w-5 h-5 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900">Tidak ada transaksi</p>
            <p className="text-xs text-gray-500">Bulan {monthLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}