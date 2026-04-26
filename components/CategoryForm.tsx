"use client";

import { useState } from "react";
import { mutate } from "swr";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

const COLORS = [
  "#F87171", "#FB923C", "#FACC15", "#4ADE80",
  "#22C55E", "#38BDF8", "#6366F1", "#A855F7",
];

export function CategoryForm({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "expense", color: COLORS[0] });

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast({ title: "Error", description: "Nama kategori wajib diisi", variant: "destructive" });
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Berhasil", description: "Kategori berhasil ditambahkan" });
      setFormData({ name: "", type: "expense", color: COLORS[0] });
      setOpen(false);
      mutate("/api/categories");
    } catch {
      toast({ title: "Error", description: "Gagal menambahkan kategori", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold transition hover:bg-amber-300 active:scale-95">
            <Plus className="w-4 h-4" />
            Kategori
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-gray-200 shadow-lg bg-white">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Tambah Kategori
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* TYPE TOGGLE */}
          <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all
                  ${formData.type === t
                    ? "bg-amber-400 text-black"
                    : "text-gray-500"
                  }`}
              >
                {t === "expense" ? "Pengeluaran" : "Pemasukan"}
              </button>
            ))}
          </div>

          {/* NAME */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Nama Kategori</p>
            <Input
              placeholder="Contoh: Makanan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-gray-200 rounded-lg focus-visible:ring-amber-400 bg-white text-sm"
            />
          </div>

          {/* COLOR PICKER */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Warna</p>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className="h-10 rounded-lg transition-all"
                  style={{
                    backgroundColor: color,
                    outline: formData.color === color ? "2px solid #f59e0b" : "none",
                    outlineOffset: "2px",
                    transform: formData.color === color ? "scale(1.05)" : "scale(1)",
                    opacity: formData.color === color ? 1 : 0.7,
                  }}
                />
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}