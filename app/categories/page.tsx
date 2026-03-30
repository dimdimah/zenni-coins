"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { CategoryForm } from "@/components/CategoryForm";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { Category } from "@/lib/types";
import { Trash2, Edit2, Loader2, Tag } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#0ea5e9",
  "#a3e635",
  "#fb923c",
];

export default function CategoriesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
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

  const {
    data: categories,
    isLoading: catLoading,
    mutate,
  } = useSWR<Category[]>(isAuthenticated ? "/api/categories" : null, fetcher);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate(
        categories?.filter((c) => c.id !== id),
        false,
      );
    } catch {
      alert("Gagal menghapus kategori.");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-amber-700 text-sm font-medium">
            Memuat kategori...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const expenseCategories =
    categories?.filter((c) => c.type === "expense") || [];
  const incomeCategories = categories?.filter((c) => c.type === "income") || [];
  const visibleCategories =
    activeTab === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* ══════════════════════════════════════════
          HEADER — amber gradient
      ══════════════════════════════════════════ */}
      <div
        className="px-5 pt-7 pb-8 md:rounded-b-3xl"
        style={{
          background:
            "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Title + action */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-xl font-extrabold tracking-tight">
                Kategori
              </h1>
              <p className="text-amber-900/50 text-xs mt-0.5">
                Kelola kategori transaksi
              </p>
            </div>
            {/* CategoryForm button tetap dari component asli */}
            <CategoryForm
              trigger={
                <button className="px-4 py-2 rounded-xl bg-gray-900 text-amber-400 text-xs font-bold hover:bg-gray-800 transition">
                  + Tambah
                </button>
              }
            />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3.5 border border-white/40">
              <p className="text-amber-900/60 text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                Pengeluaran
              </p>
              <p className="text-gray-900 text-2xl font-extrabold leading-tight">
                {expenseCategories.length}
              </p>
              <p className="text-amber-900/50 text-[10px] mt-1">kategori</p>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3.5 border border-white/40">
              <p className="text-amber-900/60 text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                Pemasukan
              </p>
              <p className="text-gray-900 text-2xl font-extrabold leading-tight">
                {incomeCategories.length}
              </p>
              <p className="text-amber-900/50 text-[10px] mt-1">kategori</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-28 md:pb-10 space-y-4">
        {/* Tab toggle */}
        <div className="bg-white rounded-2xl p-1 flex shadow-sm border border-amber-100 md:max-w-xs">
          {(["expense", "income"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-gray-900 text-amber-400 shadow"
                  : "text-amber-700/60 hover:text-amber-800"
              }`}
            >
              {tab === "expense" ? "Pengeluaran" : "Pemasukan"}
            </button>
          ))}
        </div>

        {/* Category grid */}
        {catLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : visibleCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleCategories.map((cat) => {
              const isDeleting = deletingId === cat.id;
              const isConfirming = deleteConfirmId === cat.id;

              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  isDeleting={isDeleting}
                  isConfirming={isConfirming}
                  onEdit={() => setEditingCategory(cat)}
                  onConfirm={() => setDeleteConfirmId(cat.id)}
                  onCancel={() => setDeleteConfirmId(null)}
                  onDelete={() => handleDelete(cat.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-amber-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-gray-800 font-bold text-sm mb-1">
              Belum ada kategori nih
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Tambah kategori{" "}
              {activeTab === "expense" ? "pengeluaran" : "pemasukan"} pertama
              yuk!
            </p>
            <CategoryForm />
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════ */}
      {editingCategory && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 mb-2 md:mb-0">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold text-gray-900">
                Edit Kategori
              </h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 hover:bg-amber-100 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <EditCategoryForm
              category={editingCategory}
              onSuccess={(updated) => {
                mutate(
                  categories?.map((c) => (c.id === updated.id ? updated : c)),
                  false,
                );
                setEditingCategory(null);
              }}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

function EditCategoryForm({
  category,
  onSuccess,
  onCancel,
}: {
  category: Category;
  onSuccess: (updated: Category) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [type, setType] = useState(category.type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, type }),
      });
      if (!res.ok) throw new Error();
      const updated: Category = await res.json();
      onSuccess(updated);
    } catch {
      setError("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium">
          {error}
        </p>
      )}

      {/* Name */}
      <div>
        <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">
          Nama Kategori
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-800 placeholder:text-gray-300"
          placeholder="Nama kategori"
          autoFocus
        />
      </div>

      {/* Type toggle */}
      <div>
        <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">
          Tipe
        </label>
        <div className="flex rounded-xl overflow-hidden border border-amber-200 bg-amber-50">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                type === t
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

      {/* Color picker */}
      <div>
        <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">
          Warna
        </label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-xl transition-transform hover:scale-110 ${
                color === c
                  ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                  : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-2 border border-amber-100">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs text-gray-400 font-mono flex-1">
            {color}
          </span>
          <div
            className="w-6 h-6 rounded-lg shadow-sm"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm border border-amber-200 rounded-xl hover:bg-amber-50 text-amber-700 font-semibold transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 text-sm bg-gray-900 text-amber-400 rounded-xl hover:bg-gray-800 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
