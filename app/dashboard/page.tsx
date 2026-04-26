"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightSmall,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatting";
import { DashboardStats, Transaction } from "@/lib/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
};

const getEmailUsername = (email?: string) => {
  if (!email) return "User";
  return email.split("@")[0];
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "biggest">("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [greeting, setGreeting] = useState(getGreeting());
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.push("/auth/login");
      else setUser({ email: data.user.email || "" });
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  const username = getEmailUsername(user?.email);

  const monthParam = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const { data: stats } = useSWR<DashboardStats>(
    user ? `/api/dashboard/stats?month=${monthParam}` : null,
    fetcher
  );

  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const monthLabel = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const sortedTransactions = stats?.recentTransactions
    ? activeTab === "biggest"
      ? [...stats.recentTransactions].sort((a, b) => b.amount - a.amount)
      : stats.recentTransactions
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isSurplus = !stats || stats.balance >= 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HEADER ===== */}
      <div className="bg-gray-100 border-b rounded-b-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {greeting}
              </p>

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                Hai, <span className="text-amber-500">{username}</span>
              </h1>

              <p className="text-gray-500 text-xs mt-1">
                Ringkasan keuangan bulan ini
              </p>
            </div>

            {/* Month */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-fit border border-gray-300">
              <button onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs font-semibold text-gray-700">
                {monthLabel}
              </span>
              <button onClick={nextMonth}>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* ===== BALANCE ===== */}
          <div className="mt-6 bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Saldo
              </p>
            </div>

            <p className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats ? formatCurrency(stats.balance) : "Rp 0"}
            </p>

            <span
              className={`inline-block mt-3 text-xs px-2.5 py-1 rounded-full font-medium
              ${isSurplus
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"}`}
            >
              {isSurplus ? "Surplus" : "Defisit"}
            </span>
          </div>

          {/* ===== STATS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Pengeluaran</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {stats ? formatCurrency(stats.totalExpense) : "Rp 0"}
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Pemasukan</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {stats ? formatCurrency(stats.totalIncome) : "Rp 0"}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Transaksi
          </h2>

          <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
            {(["all", "biggest"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition
                ${
                  activeTab === tab
                    ? "bg-amber-400 text-black"
                    : "text-gray-500"
                }`}
              >
                {tab === "all" ? "Semua" : "Terbesar"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-2xl overflow-hidden">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((tx: Transaction) => (
              <Link
                key={tx.id}
                href={`/transactions/${tx.id}`}
                className="flex items-center px-4 py-3 hover:bg-gray-50 transition group"
              >
                <div
                  className={`w-9 h-9 rounded-xl mr-3 flex items-center justify-center text-xs font-bold
                  ${
                    tx.type === "income"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {tx.category?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {tx.category?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatShortDate(tx.date)}
                  </p>
                </div>

                <p
                  className={`font-semibold text-sm mr-2
                  ${
                    tx.type === "income"
                      ? "text-green-600"
                      : "text-gray-800"
                  }`}
                >
                  {tx.type === "income" ? "+" : "−"}
                  {formatCurrency(tx.amount)}
                </p>

                <ChevronRightSmall className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition" />
              </Link>
            ))
          ) : (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-sm">
                Belum ada transaksi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}