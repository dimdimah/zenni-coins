"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
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
  const { data: categories, isLoading: categoriesLoading } = useSWR<Category[]>(
    "/api/categories",
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    month: getCurrentMonthString(),
  });

  const { toast } = useToast();

  const expenseCategories =
    categories?.filter((c) => c.type === "expense") || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.category_id || !formData.amount) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Berhasil",
        description: "Budget berhasil dibuat",
      });

      setFormData({
        category_id: "",
        amount: "",
        month: getCurrentMonthString(),
      });

      setOpen(false);
      mutate("/api/budgets");
    } catch {
      toast({
        title: "Error",
        description: "Gagal membuat budget",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ✅ BUTTON FIX */}
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gray-900 text-amber-400 hover:bg-gray-800 font-bold rounded-xl shadow">
          <Plus className="w-4 h-4" />
          Buat Budget
        </Button>
      </DialogTrigger>

      {/* ✅ MODAL FIX */}
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-gray-900">
            Buat Budget
          </DialogTitle>
          <p className="text-xs text-gray-400">
            Tentukan batas pengeluaran tiap kategori
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* CATEGORY */}
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wide">
              Kategori
            </label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
            >
              <SelectTrigger className="bg-amber-50 border-amber-200 focus:ring-amber-400">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
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
            <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wide">
              Jumlah (Rp)
            </label>
            <Input
              type="number"
              placeholder="500000"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="bg-amber-50 border-amber-200 focus:ring-amber-400"
            />
          </div>

          {/* MONTH */}
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wide">
              Bulan
            </label>
            <Input
              type="month"
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              className="bg-amber-50 border-amber-200 focus:ring-amber-400"
            />
          </div>

          {/* ACTION */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-amber-400 hover:bg-gray-800 font-bold rounded-xl"
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isLoading ? "Menyimpan..." : "Simpan Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}