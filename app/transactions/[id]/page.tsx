"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2, Clock, Tag, FileText,
  Calendar, Hash, Trash2, ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatting";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CATEGORY_ICONS: Record<string, string> = {
  makan: "🍽️", dapur: "🍳", transport: "🚗", belanja: "🛒",
  hiburan: "🎮", kesehatan: "💊", pendidikan: "📚", tagihan: "🧾",
  bisnis: "💼", gaji: "💵", investasi: "📈", lainnya: "📦", default: "💰",
};

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  description: string | null;
  created_at: string;
  category: { name: string } | null;
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [tx, setTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/auth/login");
        const { data, error } = await supabase
          .from("transactions")
          .select("*, category:categories(name)")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (error || !data) return setNotFound(true);
        setTx(data as Transaction);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTx();
  }, [id, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Menghapus transaksi...");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Transaksi berhasil dihapus", { id: toastId, description: "Data transaksi sudah dihapus permanen" });
      router.back();
    } catch {
      toast.error("Gagal menghapus transaksi", { id: toastId, description: "Coba lagi beberapa saat ya" });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 40%, #dbeafe 100%)" }}
      >
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !tx) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-3"
        style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 40%, #dbeafe 100%)" }}
      >
        <p className="text-gray-500 text-sm">Transaksi tidak ditemukan</p>
        <button onClick={() => router.back()} className="text-indigo-500 text-sm font-medium">
          Kembali
        </button>
      </div>
    );
  }

  const isIncome = tx.type === "income";
  const categoryName = tx.category?.name || "Unknown";
  const icon = getCategoryIcon(categoryName);

  const steps = isIncome
    ? ["Transaksi diterima", "Dana masuk ke akun", "Pemasukan tercatat"]
    : ["Transaksi dibuat", "Dana keluar dari akun", "Pengeluaran tercatat"];

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

      {/* HERO */}
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">

        {/* Amount card */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 mb-4 flex flex-col items-center text-center"
          style={{
            background: isIncome
              ? "linear-gradient(135deg, rgba(5,150,105,0.85) 0%, rgba(52,211,153,0.85) 100%)"
              : "linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(139,92,246,0.85) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: isIncome
              ? "0 8px 32px rgba(5,150,105,0.25)"
              : "0 8px 32px rgba(99,102,241,0.25)",
          }}
        >
          {/* Glare */}
          <div
            className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />

          <div
            className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center text-3xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {icon}
          </div>

          <p className="text-white text-4xl font-bold tabular-nums mb-1">
            {isIncome ? "+" : "−"}{formatCurrency(tx.amount)}
          </p>

          <p className="text-white/80 font-medium text-base mb-3">{categoryName}</p>

          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            {isIncome ? "↑ Pemasukan" : "↓ Pengeluaran"}
          </span>
        </div>

        <div className="space-y-3 pb-28">
          {/* Status steps */}
          <div className="rounded-2xl p-5" style={glassCard}>
            <p className="text-gray-700 font-semibold text-sm mb-4">Status Transaksi</p>
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <CheckCircle2
                      className="w-5 h-5 shrink-0"
                      style={{ color: isIncome ? "#059669" : "#6366f1" }}
                    />
                    {i < steps.length - 1 && (
                      <div
                        className="w-0.5 h-6 my-0.5 rounded-full"
                        style={{ background: isIncome ? "rgba(5,150,105,0.2)" : "rgba(99,102,241,0.2)" }}
                      />
                    )}
                  </div>
                  <p className="text-gray-700 text-sm pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail rows */}
          <div className="rounded-2xl overflow-hidden" style={glassCard}>
            <div
              className="px-5 py-3"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <p className="text-gray-700 font-semibold text-sm">Rincian Transaksi</p>
            </div>

            {[
              {
                icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
                label: "Status",
                value: (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Selesai ✓
                  </span>
                ),
              },
              {
                icon: <Tag className="w-4 h-4 text-gray-400" />,
                label: "Kategori",
                value: <span className="text-xs font-semibold text-gray-800">{icon} {categoryName}</span>,
              },
              {
                icon: <Calendar className="w-4 h-4 text-gray-400" />,
                label: "Tanggal",
                value: <span className="text-xs font-semibold text-gray-800">{formatFullDate(tx.date)}</span>,
              },
              {
                icon: <Clock className="w-4 h-4 text-gray-400" />,
                label: "Waktu",
                value: <span className="text-xs font-semibold text-gray-800">{formatTime(tx.date)}</span>,
              },
              ...(tx.description
                ? [{
                    icon: <FileText className="w-4 h-4 text-gray-400" />,
                    label: "Catatan",
                    value: <span className="text-xs font-semibold text-gray-800 text-right">{tx.description}</span>,
                  }]
                : []),
              {
                icon: <Hash className="w-4 h-4 text-gray-400" />,
                label: "ID Transaksi",
                value: <span className="text-xs font-mono text-gray-400 max-w-40 truncate">{tx.id}</span>,
              },
            ].map((row, idx, arr) => (
              <div
                key={idx}
                className="flex items-center justify-between px-5 py-3.5"
                style={idx < arr.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.05)" } : {}}
              >
                <div className="flex items-center gap-2 text-gray-400">
                  {row.icon}
                  <span className="text-xs">{row.label}</span>
                </div>
                {row.value}
              </div>
            ))}

            {/* Total row */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderTop: "1px solid rgba(0,0,0,0.06)",
                background: "rgba(255,255,255,0.4)",
              }}
            >
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: isIncome ? "#059669" : "#1f2937" }}
              >
                {isIncome ? "+" : "−"}{formatCurrency(tx.amount)}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-center text-xs text-gray-400">
            Dicatat pada {formatFullDate(tx.created_at)}, {formatTime(tx.created_at)}
          </p>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition disabled:opacity-50"
                style={{
                  background: "rgba(254,226,226,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(254,202,202,0.8)",
                  color: "#ef4444",
                }}
              >
                <Trash2 className="w-4 h-4" />
                Hapus Transaksi
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent
              className="rounded-2xl mx-4 border-0"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(20px)",
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Transaksi{" "}
                  <span className="font-semibold text-gray-700">
                    {isIncome ? "+" : "−"}{formatCurrency(tx.amount)}
                  </span>{" "}
                  dari kategori{" "}
                  <span className="font-semibold text-gray-700">{categoryName}</span>{" "}
                  akan dihapus permanen dan tidak bisa dikembalikan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}