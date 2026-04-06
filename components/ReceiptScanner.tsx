"use client";

// components/ReceiptScanner.tsx

import { useRef, useState } from "react";
import { ScanLine, Loader2, Camera, ImagePlus } from "lucide-react";

export type ScanResult = {
  amount: string;
  merchant: string;
  date: string;
  category: string;
  notes: string;
};

interface ReceiptScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setError(null);
    setIsScanning(true);

    try {
      // ── convert ke base64 ──
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // hilangkan prefix "data:image/jpeg;base64,"
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // ── preview gambar ──
      setPreview(URL.createObjectURL(file));

      // ── kirim ke API route ──
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal scan struk");
      }

      // ── teruskan hasil ke parent form ──
      onScanComplete(data as ScanResult);
      setPreview(null); // bersihkan preview setelah sukses
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setPreview(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset input biar bisa upload file yang sama lagi
    e.target.value = "";
    processImage(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ── tombol scan ── */}
      <div className="flex gap-2">
        {/* Kamera — langsung buka kamera di mobile */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isScanning}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 text-xs font-medium"
        >
          {isScanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {isScanning ? "Memproses..." : "Foto Struk"}
        </button>

        {/* Galeri — pilih dari galeri */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 text-xs font-medium"
        >
          <ImagePlus className="w-4 h-4" />
          Dari Galeri
        </button>
      </div>

      {/* ── preview gambar saat processing ── */}
      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview struk" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <ScanLine className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white text-xs font-semibold">Membaca struk...</span>
          </div>
        </div>
      )}

      {/* ── error message ── */}
      {error && (
        <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ── hidden file inputs ── */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"   // buka kamera belakang langsung
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}