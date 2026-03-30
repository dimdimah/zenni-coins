"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import  TransactionForm  from "@/components/TransactionForm";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatting";
import { Trash2 } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function TransactionsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.push("/auth/login");
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const { data: transactions, isLoading: txLoading } = useSWR<Transaction[]>(
    isAuthenticated ? "/api/transactions" : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transaksi</h1>
            <p className="text-muted-foreground">Kelola transaksi pemasukan dan pengeluaran Anda</p>
          </div>
          <TransactionForm />
        </div> */}

        {/* Transactions List */}
        {!txLoading && transactions && transactions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 divide-y">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{tx.category?.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatShortDate(tx.date)}
                        {tx.description && ` • ${tx.description}`}
                      </p>
                    </div>
                    <div
                      className={`font-semibold text-right ${
                        tx.type === "income" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                    <button className="ml-4 p-2 hover:bg-muted rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Belum ada transaksi</h3>
                <p className="text-muted-foreground mb-6">
                  Mulai dengan menambahkan transaksi pertama Anda
                </p>
                <TransactionForm />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
