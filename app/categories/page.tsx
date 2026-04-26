"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { CategoryForm } from "@/components/CategoryForm";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { Category } from "@/lib/types";
import { Loader2, Tag } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const PRESET_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#8b5cf6","#ec4899","#64748b","#0ea5e9",
  "#a3e635","#fb923c",
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
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.push("/auth/login");
      else setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const { data: categories, isLoading: catLoading, mutate } = useSWR<Category[]>(
    isAuthenticated ? "/api/categories" : null,
    fetcher
  );

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate(categories?.filter((c) => c.id !== id), false);
    } catch {
      alert("Gagal menghapus kategori.");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat kategori...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const expenseCategories = categories?.filter((c) => c.type === "expense") || [];
  const incomeCategories = categories?.filter((c) => c.type === "income") || [];
  const visibleCategories = activeTab === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER — sama persis strukturnya dengan Dashboard */}
      <div className="bg-gray-100 border-b rounded-b-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Kategori</h1>
              <p className="text-gray-500 text-xs mt-1">Kelola kategori transaksi</p>
            </div>

            <CategoryForm
              trigger={
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold transition hover:bg-amber-300 active:scale-95">
                  + Tambah
                </button>
              }
            />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Pengeluaran</p>
              <p className="text-2xl font-semibold text-gray-900">{expenseCategories.length}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Pemasukan</p>
              <p className="text-2xl font-semibold text-gray-900">{incomeCategories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-32 space-y-4">

        {/* TAB — sama dengan Dashboard */}
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1 w-fit">
          {(["expense", "income"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition
                ${activeTab === tab
                  ? "bg-amber-400 text-black"
                  : "text-gray-500"
                }`}
            >
              {tab === "expense" ? "Pengeluaran" : "Pemasukan"}
            </button>
          ))}
        </div>

        {/* LIST */}
        {catLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : visibleCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isDeleting={deletingId === cat.id}
                isConfirming={deleteConfirmId === cat.id}
                onEdit={() => setEditingCategory(cat)}
                onConfirm={() => setDeleteConfirmId(cat.id)}
                onCancel={() => setDeleteConfirmId(null)}
                onDelete={() => handleDelete(cat.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-900 font-semibold text-sm mb-1">Belum ada kategori</p>
            <p className="text-gray-400 text-xs mb-4">Tambahkan kategori pertama kamu</p>
            <div className="flex justify-center">
              <CategoryForm />
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingCategory && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingCategory(null); }}
        >
          <div className="w-full max-w-md rounded-2xl p-6 bg-white border shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Edit Kategori</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-lg"
              >
                ×
              </button>
            </div>
            <EditCategoryForm
              category={editingCategory}
              onSuccess={(updated) => {
                mutate(categories?.map((c) => (c.id === updated.id ? updated : c)), false);
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

/* ================= EDIT FORM ================= */
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
    if (!name.trim()) { setError("Nama tidak boleh kosong"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, type }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onSuccess(updated);
    } catch {
      setError("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama kategori"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white"
      />

      {/* Tab type — sama dengan Dashboard */}
      <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition
              ${type === t
                ? "bg-amber-400 text-black"
                : "text-gray-500"
              }`}
          >
            {t === "expense" ? "Pengeluaran" : "Pemasukan"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="w-8 h-8 rounded-lg transition-all"
            style={{
              backgroundColor: c,
              outline: color === c ? `2px solid #f59e0b` : "none",
              outlineOffset: "2px",
            }}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2 text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}