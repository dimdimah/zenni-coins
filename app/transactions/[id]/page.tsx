"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Clock,
  Tag,
  FileText,
  Calendar,
  Hash,
  Trash2,
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
  makan: "🍽️",
  dapur: "🍳",
  transport: "🚗",
  belanja: "🛒",
  hiburan: "🎮",
  kesehatan: "💊",
  pendidikan: "📚",
  tagihan: "🧾",
  bisnis: "💼",
  gaji: "💵",
  investasi: "📈",
  lainnya: "📦",
  default: "💰",
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Transaksi berhasil dihapus", {
        id: toastId,
        description: "Data transaksi sudah dihapus permanen",
      });

      router.back();
    } catch {
      toast.error("Gagal menghapus transaksi", {
        id: toastId,
        description: "Coba lagi beberapa saat ya",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !tx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 gap-3">
        <p className="text-gray-500 text-sm">Transaksi tidak ditemukan</p>
        <div></div>
      </div>
    );
  }

  const isIncome = tx.type === "income";
  const categoryName = tx.category?.name || "Unknown";
  const icon = getCategoryIcon(categoryName);

  const accentBg = isIncome
    ? "linear-gradient(135deg, #1A8A5A 0%, #22c55e 60%, #4ade80 100%)"
    : "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)";

  const amountColor = isIncome ? "text-emerald-400" : "text-white";
  const badgeBg = isIncome
    ? "bg-emerald-400/20 text-emerald-400"
    : "bg-white/25 text-gray-900";

  const steps = isIncome
    ? ["Transaksi diterima", "Dana masuk ke akun", "Pemasukan tercatat"]
    : ["Transaksi dibuat", "Dana keluar dari akun", "Pengeluaran tercatat"];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* ── HEADER ── */}
      <div
        className="px-5 pt-7 pb-10 md:rounded-b-3xl"
        style={{ background: accentBg }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex flex-col items-center text-center gap-2 mb-2">
            <div className="w-16 h-16 rounded-3xl bg-white/25 flex items-center justify-center text-3xl mb-1">
              {icon}
            </div>
            <p className={`text-4xl font-extrabold tracking-tight ${amountColor}`}>
              {isIncome ? "+" : "-"}
              {formatCurrency(tx.amount)}
            </p>
            <p className="text-amber-700 font-semibold text-base">
              {categoryName}
            </p>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${badgeBg}`}>
              {isIncome ? "Pemasukan" : "Pengeluaran"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-lg mx-auto px-4 -mt-4 pb-28 space-y-3">
        {/* Status steps */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <p className="text-gray-800 font-bold text-sm mb-3">Status Transaksi</p>
          <div className="flex flex-col gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-6 bg-amber-200 my-0.5" />
                  )}
                </div>
                <p className="text-gray-700 text-sm pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rincian */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50/60 border-b border-amber-100">
            <p className="text-gray-800 font-bold text-sm">Rincian Transaksi</p>
          </div>

          <div className="divide-y divide-amber-50">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2 text-gray-500">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs">Status</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Selesai ✓
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2 text-gray-500">
                <Tag className="w-4 h-4" />
                <span className="text-xs">Kategori</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">
                {icon} {categoryName}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Tanggal</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">
                {formatFullDate(tx.date)}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Waktu</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">
                {formatTime(tx.date)}
              </span>
            </div>

            {tx.description && (
              <div className="flex items-start justify-between px-4 py-3.5 gap-4">
                <div className="flex items-center gap-2 text-gray-500 shrink-0">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Catatan</span>
                </div>
                <span className="text-xs font-semibold text-gray-800 text-right">
                  {tx.description}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2 text-gray-500">
                <Hash className="w-4 h-4" />
                <span className="text-xs">ID Transaksi</span>
              </div>
              <span className="text-xs font-mono text-gray-500 max-w-40 truncate">
                {tx.id}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 bg-amber-50/40">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className={`text-sm font-extrabold ${isIncome ? "text-emerald-600" : "text-gray-900"}`}>
                {isIncome ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Dicatat pada */}
        <p className="text-center text-[10px] text-gray-500">
          Dicatat pada {formatFullDate(tx.created_at)},{" "}
          {formatTime(tx.created_at)}
        </p>

        {/* ── TOMBOL HAPUS ── */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Transaksi
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent className="rounded-2xl mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
              <AlertDialogDescription>
                Transaksi{" "}
                <span className="font-semibold text-gray-700">
                  {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>{" "}
                dari kategori{" "}
                <span className="font-semibold text-gray-700">
                  {categoryName}
                </span>{" "}
                akan dihapus permanen dan tidak bisa dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                Batal
              </AlertDialogCancel>
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
  );
}