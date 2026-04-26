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
    <div className="bg-white rounded-xl p-4 border border-gray-200 group relative hover:border-gray-300 transition-colors">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl shrink-0"
          style={{ backgroundColor: category.color }}
        />

        <div className="min-w-0">
          <p className="text-gray-900 font-semibold text-sm truncate">
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
            className="flex-1 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1 font-semibold"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Hapus"
            )}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            Batal
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 text-xs bg-amber-400 text-black rounded-lg hover:bg-amber-300 transition flex items-center justify-center gap-1 font-semibold"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-1 font-semibold"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}