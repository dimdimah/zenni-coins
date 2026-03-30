"use client";

import { Category } from "@/lib/types";
import { Trash2, Edit2, Loader2 } from "lucide-react";

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  isDeleting,
  isConfirming,
  onConfirm,
  onCancel,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 group relative hover:border-amber-200 transition-colors">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl shrink-0 shadow-sm"
          style={{ backgroundColor: category.color }}
        />

        <div className="min-w-0">
          <p className="text-gray-800 font-bold text-sm truncate">
            {category.name}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {category.type === "expense" ? "Pengeluaran" : "Pemasukan"}
          </p>
        </div>
      </div>

      {/* ACTION */}
      {isConfirming ? (
        <div className="flex gap-1.5">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 py-1.5 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-1 font-semibold"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Hapus"
            )}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition font-semibold"
          >
            Batal
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition flex items-center justify-center gap-1 font-semibold"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-1.5 text-xs bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-1 font-semibold"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}