"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatting";
import { DashboardStats, Transaction } from "@/lib/types";
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

const chartColors = ["#F5A623", "#1A8A5A", "#2471A3", "#E05C2A", "#8B5CF6"];

/* ================= HELPERS ================= */

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

/* ================= COMPONENT ================= */

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "biggest">("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [greeting, setGreeting] = useState(getGreeting());

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
          router.push("/auth/login");
        } else {
          setUser({ email: data.user.email || "" });
        }
      } catch {
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  /* update greeting tiap 1 menit */
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const username = getEmailUsername(user?.email);

  const monthParam = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const { data: stats } = useSWR<DashboardStats>(
    user ? `/api/dashboard/stats?month=${monthParam}` : null,
    fetcher,
    { revalidateOnFocus: false }
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
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-amber-700 text-sm font-medium">
            Memuat Beranda anda...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isSurplus = !stats || stats.balance >= 0;

  return (
    <div className="min-h-screen bg-amber-50">

      {/* ================= HEADER ================= */}
      <div
        className="px-5 pt-7 pb-8 md:rounded-b-3xl"
        style={{
          background:
            "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Greeting */}
          <div className="mb-6">
            <p className="text-gray-900 text-xl font-extrabold tracking-tight">
              {greeting} 👋
            </p>

            <p
              title={user.email}
              className="text-gray-900/60 text-base mt-0.5 tracking-tight max-w-45 truncate"
            >
              {username}
            </p>
          </div>

          

          {/* Month nav */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-900" />
            </button>

            <span className="text-gray-900 font-bold text-sm">
              {monthLabel}
            </span>

            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-900" />
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3.5 border border-white/40">
              <p className="text-amber-900/60 text-[10px] font-semibold uppercase mb-1.5">
                Pengeluaran
              </p>
              <p className="text-gray-900 text-xl font-extrabold">
                {stats ? formatCurrency(stats.totalExpense) : "Rp 0"}
              </p>
            </div>

            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3.5 border border-white/40">
              <p className="text-amber-900/60 text-[10px] font-semibold uppercase mb-1.5">
                Pemasukan
              </p>
              <p className="text-gray-900 text-xl font-extrabold">
                {stats ? formatCurrency(stats.totalIncome) : "Rp 0"}
              </p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-gray-900 rounded-2xl p-3.5 flex items-center justify-between md:block">
              <div>
                <p className="text-amber-400/70 text-[10px] font-semibold mb-1.5">
                  Saldo
                </p>
                <p className={`text-xl font-extrabold ${isSurplus ? "text-amber-400" : "text-red-400"}`}>
                  {stats ? formatCurrency(stats.balance) : "Rp 0"}
                </p>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isSurplus
                  ? "bg-amber-400/20 text-amber-400"
                  : "bg-red-400/20 text-red-400"
              }`}>
                {isSurplus ? "Surplus" : "Defisit"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-28 space-y-4">

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 flex shadow-sm border border-amber-100 md:max-w-xs">
          {(["all", "biggest"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                activeTab === tab
                  ? "bg-gray-900 text-amber-400"
                  : "text-amber-700/60"
              }`}
            >
              {tab === "all" ? "Semua Transaksi" : "Transaksi Terbesar"}
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((tx: Transaction) => (
              <div key={tx.id} className="flex items-center px-4 py-3 border-b">
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {tx.category?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatShortDate(tx.date)}
                  </p>
                </div>

                <p className={`font-bold ${
                  tx.type === "income" ? "text-emerald-600" : ""
                }`}>
                  {tx.type === "income" ? "+" : ""}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              Belum ada transaksi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}