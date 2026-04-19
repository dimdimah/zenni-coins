"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { BudgetForm } from "@/components/BudgetForm";
import { Budget } from "@/lib/types";
import { formatCurrency, getCurrentMonthString } from "@/lib/utils/formatting";
import { AlertCircle, Trash2 } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
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
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-amber-700 text-sm font-medium">
            Memuat budget...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Hitung pengeluaran
  const categorySpending: Record<string, number> = {};
  transactions?.forEach((tx: any) => {
    if (tx.type === "expense") {
      categorySpending[tx.category_id] =
        (categorySpending[tx.category_id] || 0) + Number(tx.amount);
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
    <div className="min-h-screen bg-amber-50">

      {/* HEADER */}
      <div
        className="px-5 pt-7 pb-8 md:rounded-b-3xl"
        style={{
          background:
            "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 text-xl font-extrabold">
              Budget
            </h1>
            <p className="text-amber-900/60 text-xs mt-1">
              Atur dan pantau pengeluaran kamu
            </p>
          </div>

          <BudgetForm />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-28 space-y-4">

        {budgetsWithStatus.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {budgetsWithStatus.map((budget) => (
              <div
                key={budget.id}
                className={`glass rounded-2xl p-4 shadow-lg ${
                  budget.isExceeded
                    ? "border-red-200/50"
                    : "border-white/60"
                }`}
              >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-amber-900 font-bold text-sm">
                    {budget.category?.name}
                  </p>

                  <button className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                  </button>
                </div>

                {/* ALERT */}
                {budget.isExceeded && (
                  <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-500 font-medium">
                      Lebih {formatCurrency(budget.spent - budget.amount)}
                    </span>
                  </div>
                )}

                {/* PROGRESS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Pengeluaran</span>
                    <span className="text-gray-700 font-semibold">
                      {formatCurrency(budget.spent)} /{" "}
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>

                  <div className="w-full bg-amber-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        budget.isExceeded
                          ? "bg-red-500"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${budget.percentage}%` }}
                    />
                  </div>
                </div>

                {/* FOOTER */}
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/20">
                  <div>
                    <p className="text-[10px] text-gray-400">Sisa</p>
                    <p
                      className={`text-sm font-bold ${
                        budget.remaining < 0
                          ? "text-red-500"
                          : "text-amber-600"
                      }`}
                    >
                      {formatCurrency(Math.abs(budget.remaining))}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400">Penggunaan</p>
                    <p className="text-sm font-bold text-gray-800">
                      {Math.round(budget.percentage)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              💰
            </div>
            <p className="text-gray-800 font-bold text-sm mb-1">
              Belum ada budget
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Yuk atur budget pertamamu!
            </p>

            <BudgetForm />
          </div>
        )}
      </div>
    </div>
  );
}
