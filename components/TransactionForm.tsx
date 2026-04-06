"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Category } from "@/lib/types";
import { Delete, CheckCheck, Calendar } from "lucide-react";
import { ReceiptScanner, ScanResult } from "./ReceiptScanner";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

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

function formatRupiah(val: string): string {
  if (!val || val === "0") return "0";
  return parseInt(val).toLocaleString("id-ID");
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Hari ini";
  if (dateStr === yesterday) return "Kemarin";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TransactionFormContent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scanHighlight, setScanHighlight] = useState(false);

  const visibleCategories =
    (type === "expense"
      ? categories?.filter((c) => c.type === "expense")
      : categories?.filter((c) => c.type === "income")) || [];

  const handleNumpad = (key: string) => {
    if (key === "AC") return setAmount("0");
    if (key === "⌫")
      return setAmount((p) => (p.length <= 1 ? "0" : p.slice(0, -1)));
    if (key === "000") return setAmount((p) => (p === "0" ? "0" : p + "000"));
    setAmount((p) => (p === "0" ? key : p.length >= 12 ? p : p + key));
  };

  const handleScanComplete = (result: ScanResult) => {
    if (result.amount && result.amount !== "0") {
      setAmount(result.amount);
    }

    if (result.date) {
      setDate(result.date);
    }

    const notesText = [result.merchant, result.notes]
      .filter(Boolean)
      .join(" — ");
    if (notesText) setNotes(notesText);

    if (result.category && categories) {
      const matched = categories.find(
        (c) =>
          c.type === "expense" &&
          c.name.toLowerCase().includes(result.category.toLowerCase())
      );
      if (matched) {
        setCategoryId(matched.id);
        setType("expense");
      }
    }

    setScanHighlight(true);
    setTimeout(() => setScanHighlight(false), 1500);

    toast.success("Struk berhasil dibaca! 🎉", {
      description: `Rp ${parseInt(result.amount || "0").toLocaleString("id-ID")} dari ${result.merchant || "merchant"}`,
    });
  };

  const handleSubmit = async () => {
    if (!categoryId || !amount || amount === "0") {
      toast.error("Lengkapi form dulu ya!", {
        description: "Pilih kategori dan masukkan jumlah",
      });
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading("Menyimpan transaksi...");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          amount: parseFloat(amount),
          type,
          description: notes,
          date,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Transaksi ditambahkan! ✅", {
        id: toastId,
        description: `Rp ${formatRupiah(amount)} berhasil disimpan`,
      });

      setAmount("0");
      setCategoryId("");
      setNotes("");
      mutate("/api/transactions");
      mutate((key: string) => key.startsWith("/api/dashboard"), undefined, {
        revalidate: true,
      });
      onSuccess?.();
    } catch {
      toast.error("Gagal menyimpan transaksi", {
        id: toastId,
        description: "Coba lagi beberapa saat ya",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const numpadRows = [
    ["AC", "×", "÷", "⌫"],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "✓"],
    ["0", "000"],
  ];

  return (
    <div
      className={`flex flex-col gap-3 px-4 pb-6 overflow-y-auto transition-all duration-300 ${
        scanHighlight ? "bg-emerald-50/60 rounded-2xl" : ""
      }`}
    >
      {/* TYPE TOGGLE */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setCategoryId("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              type === t
                ? t === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-emerald-500 text-white"
                : "bg-white text-slate-500"
            }`}
          >
            {t === "expense" ? "Pengeluaran" : "Pemasukan"}
          </button>
        ))}
      </div>

      {/* AMOUNT */}
      <div className={`text-center py-1 rounded-xl transition-all ${scanHighlight ? "bg-emerald-100/60" : ""}`}>
        <p className="text-slate-400 text-xs mb-0.5">Rp</p>
        <p className="text-4xl font-bold text-slate-900 tracking-tight">
          {formatRupiah(amount)}
        </p>
      </div>

      {/* CATEGORY SCROLL */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 w-max">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${
                  categoryId === cat.id
                    ? "border-[#0F172A] bg-slate-100"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-xl">{getCategoryIcon(cat.name)}</span>
                <span className="text-[10px] text-slate-600 w-13 text-center leading-tight truncate">
                  {cat.name}
                </span>
              </button>
            ))
          ) : (
            <p className="text-slate-400 text-xs py-1">Belum ada kategori</p>
          )}
        </div>
      </div>

      {/* DATE + NOTES */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" />
          {formatDateLabel(date)}
        </button>
        {showDatePicker && (
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setShowDatePicker(false);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white"
          />
        )}
        <input
          type="text"
          placeholder="Notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 text-xs bg-slate-100 rounded-lg px-3 py-1.5 outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
        />
      </div>

      {/* NUMPAD */}
      <div className="grid grid-cols-4 gap-2">
        {numpadRows.map((row, ri) =>
          row.map((key, ki) => {
            const isConfirm = key === "✓";
            const isAC = key === "AC";
            const isOp = ["×", "÷", "-", "+"].includes(key);
            const isBack = key === "⌫";

            if (isConfirm) {
              return (
                <button
                  key="confirm"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{ gridRow: "span 2" }}
                  className="bg-[#0F172A] rounded-2xl flex items-center justify-center text-white hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                >
                  <CheckCheck className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={`${ri}-${ki}`}
                onClick={() => handleNumpad(key)}
                className={`h-12 rounded-2xl flex items-center justify-center font-semibold text-sm transition-all active:scale-95
                  ${
                    isAC
                      ? "bg-red-100 text-red-500 hover:bg-red-200"
                      : isOp || isBack
                        ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }
                `}
              >
                {isBack ? <Delete className="w-4 h-4" /> : key}
              </button>
            );
          }),
        )}
      </div>

      {/* RECEIPT SCANNER */}
      <ReceiptScanner onScanComplete={handleScanComplete} />
    </div>
  );
}