"use client";

import { useState } from "react";
import { mutate } from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

const COLORS = [
  "#F5A623", "#1A8A5A", "#2471A3", "#E05C2A",
  "#8B5CF6", "#EF4444", "#14B8A6", "#F97316",
];

export function CategoryForm({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: COLORS[0],
  });

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });

      setFormData({
        name: "",
        type: "expense",
        color: COLORS[0],
      });

      setOpen(false);
      mutate("/api/categories");
    } catch {
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-amber-400 text-xs font-bold hover:bg-gray-800 transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="rounded-3xl p-0 overflow-hidden max-w-md">
        {/* HEADER */}
        <div className="px-5 pt-5 pb-4 border-b border-amber-100 bg-amber-50/50">
          <DialogTitle className="text-sm font-extrabold text-gray-900">
            Tambah Kategori
          </DialogTitle>
          <p className="text-xs text-amber-900/60 mt-1">
            Buat kategori baru untuk mengorganisir transaksi
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* TYPE */}
          <div>
            <p className="text-[10px] font-bold text-gray-700 mb-1 uppercase">
              Tipe
            </p>
            <div className="flex rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                    formData.type === t
                      ? t === "expense"
                        ? "bg-gray-900 text-amber-400"
                        : "bg-emerald-600 text-white"
                      : "text-amber-700/60 hover:text-amber-800"
                  }`}
                >
                  {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                </button>
              ))}
            </div>
          </div>

          {/* NAME */}
          <div>
            <p className="text-[10px] font-bold text-gray-700 mb-1 uppercase">
              Nama Kategori
            </p>
            <Input
              placeholder="Contoh: Makanan"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-amber-50/30 border-amber-200 focus:ring-amber-400 text-sm"
            />
          </div>

          {/* COLOR */}
          <div>
            <p className="text-[10px] font-bold text-gray-700 mb-1 uppercase">
              Warna
            </p>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-full h-10 rounded-xl transition-transform hover:scale-105 ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-gray-900 scale-105"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm bg-gray-900 text-amber-400 rounded-xl hover:bg-gray-800 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Menyimpan..." : "Tambah Kategori"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}