"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/lib/types";
import { Plus, Loader2 } from "lucide-react";
import { getCurrentMonthString } from "@/lib/utils/formatting";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function BudgetForm() {
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    month: getCurrentMonthString(),
  });

  const { toast } = useToast();
  const expenseCategories = categories?.filter((c) => c.type === "expense") || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.category_id || !formData.amount) {
      return toast({ title: "Error", description: "Semua field wajib diisi", variant: "destructive" });
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Berhasil", description: "Budget berhasil dibuat" });
      setFormData({ category_id: "", amount: "", month: getCurrentMonthString() });
      setOpen(false);
      mutate("/api/budgets");
    } catch {
      toast({ title: "Error", description: "Gagal membuat budget", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          <Plus className="w-4 h-4" />
          Buat Budget
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-md rounded-3xl p-0 overflow-hidden border-0"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Modal header strip */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <DialogTitle className="text-lg font-bold text-gray-900">
            Buat Budget
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Tentukan batas pengeluaran tiap kategori
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* CATEGORY */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Kategori
            </label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger
                className="rounded-xl border-0 text-sm"
                style={{ background: "rgba(99,102,241,0.07)", color: "#374151" }}
              >
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AMOUNT */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Jumlah (Rp)
            </label>
            <Input
              type="number"
              placeholder="500000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="rounded-xl border-0 text-sm"
              style={{ background: "rgba(99,102,241,0.07)" }}
            />
          </div>

          {/* MONTH */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Bulan
            </label>
            <Input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="rounded-xl border-0 text-sm"
              style={{ background: "rgba(99,102,241,0.07)" }}
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Menyimpan..." : "Simpan Budget"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}