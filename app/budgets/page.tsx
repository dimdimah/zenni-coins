"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { BudgetForm } from "@/components/BudgetForm";
import { Budget } from "@/lib/types";
import { formatCurrency, getCurrentMonthString } from "@/lib/utils/formatting";
import { AlertCircle, Trash2, Wallet } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
};

export default function BudgetsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const { data: budgets } = useSWR<Budget[]>(
    isAuthenticated ? `/api/budgets?month=${getCurrentMonthString()}` : null,
    fetcher
  );

  const { data: transactions } = useSWR(
    isAuthenticated ? `/api/transactions?month=${getCurrentMonthString()}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 40%, #dbeafe 100%)" }}
      >
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-indigo-600 text-sm font-medium">Memuat budget...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const categorySpending: Record<string, number> = {};
  transactions?.forEach((tx: any) => {
    if (tx.type === "expense") {
      categorySpending[tx.category_id] = (categorySpending[tx.category_id] || 0) + Number(tx.amount);
    }
  });

  const budgetsWithStatus =
    budgets?.map((b) => {
      const spent = categorySpending[b.category_id] || 0;
      const remaining = b.amount - spent;
      const percentage = Math.min((spent / b.amount) * 100, 100);
      const isExceeded = spent > b.amount;
      return { ...b, spent, remaining, percentage, isExceeded };
    }) || [];

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 40%, #dbeafe 100%)" }}
    >
      {/* Blobs */}
      <div className="pointer-events-none fixed -top-24 -right-24 w-96 h-96 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)" }} />
      <div className="pointer-events-none fixed -bottom-32 -left-20 w-80 h-80 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #c4b5fd 0%, transparent 70%)" }} />

      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-5 pt-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
            <p className="text-gray-500 text-sm mt-1">Atur dan pantau pengeluaran kamu</p>
          </div>
          <BudgetForm />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 pb-28 space-y-4">
        {budgetsWithStatus.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {budgetsWithStatus.map((budget) => (
              <div
                key={budget.id}
                className="rounded-2xl p-5"
                style={
                  budget.isExceeded
                    ? {
                        background: "rgba(255,241,242,0.70)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(254,202,202,0.8)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      }
                    : glassCard
                }
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: budget.isExceeded
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(99,102,241,0.10)",
                      }}
                    >
                      <Wallet
                        className="w-4 h-4"
                        style={{ color: budget.isExceeded ? "#ef4444" : "#6366f1" }}
                      />
                    </div>
                    <p className="text-gray-800 font-semibold text-sm">
                      {budget.category?.name}
                    </p>
                  </div>

                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/60"
                    style={{ background: "rgba(255,255,255,0.4)" }}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Alert */}
                {budget.isExceeded && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs text-red-500 font-medium">
                      Lebih {formatCurrency(budget.spent - budget.amount)}
                    </span>
                  </div>
                )}

                {/* Progress */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Pengeluaran</span>
                    <span className="text-gray-700 font-semibold">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${budget.percentage}%`,
                        background: budget.isExceeded
                          ? "linear-gradient(90deg, #ef4444, #f87171)"
                          : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      }}
                    />
                  </div>
                </div>

                {/* Footer stats */}
                <div
                  className="grid grid-cols-2 gap-4 pt-3"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Sisa</p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: budget.remaining < 0 ? "#ef4444" : "#6366f1" }}
                    >
                      {formatCurrency(Math.abs(budget.remaining))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Penggunaan</p>
                    <p className="text-sm font-bold text-gray-800">
                      {Math.round(budget.percentage)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-12 text-center" style={glassCard}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: "rgba(255,255,255,0.6)" }}
            >
              💰
            </div>
            <p className="text-gray-900 font-semibold text-sm mb-1">Belum ada budget</p>
            <p className="text-gray-400 text-xs mb-4">Yuk atur budget pertamamu!</p>
            <div className="flex justify-center">
              <BudgetForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}