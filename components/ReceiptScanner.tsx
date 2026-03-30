"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";

interface ReceiptData {
  storeName: string;
  totalAmount: number;
  currency: string;
  date: string;
  categoryId?: string;
  categoryName: string;
  description: string;
  items: Array<{
    name: string;
    price: number;
  }>;
  confidence: number;
}

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Pilih file gambar yang valid",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran gambar maksimal 5MB",
        variant: "destructive",
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!image) return;

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("/api/ai/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal memproses struk");
      }

      const result = await response.json();
      setScannedData(result.data);
      setIsEditing(true);

      toast({
        title: "Berhasil",
        description: "Struk berhasil dipindai. Silakan periksa data berikut:",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memproses struk",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (scannedData) {
      onScanComplete(scannedData);
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setImage(null);
    setPreview("");
    setScannedData(null);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateScannedData = (field: string, value: any) => {
    if (scannedData) {
      setScannedData({
        ...scannedData,
        [field]: value,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="w-4 h-4" />
          Scan Struk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Struk Belanja</DialogTitle>
          <DialogDescription>
            Ambil foto struk belanja dan AI akan mengekstrak datanya secara otomatis
          </DialogDescription>
        </DialogHeader>

        {!scannedData ? (
          <div className="space-y-4">
            {/* Image Preview */}
            {preview && (
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                <div className="relative w-full h-96">
                  <Image
                    src={preview}
                    alt="Receipt preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* File Input Area */}
            {!preview && (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-muted");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("bg-muted");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("bg-muted");
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    handleFileChange(file);
                  }
                }}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Pilih atau drag struk di sini</p>
                <p className="text-sm text-muted-foreground">JPG, PNG, GIF atau WebP (Max 5MB)</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileChange(file);
                }
              }}
              className="hidden"
            />

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => resetForm()}
              >
                Batal
              </Button>
              <Button
                onClick={handleScan}
                disabled={!preview || isScanning}
              >
                {isScanning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isScanning ? "Memproses..." : "Scan Struk"}
              </Button>
            </div>
          </div>
        ) : (
          /* Scanned Data Review */
          <div className="space-y-4">
            {/* Confidence Warning */}
            {scannedData.confidence < 0.8 && (
              <div className="p-4 bg-warning/10 border border-warning text-warning rounded-lg">
                <p className="text-sm">
                  ⚠️ Tingkat kepercayaan rendah ({Math.round(scannedData.confidence * 100)}%). 
                  Mohon periksa data dengan teliti.
                </p>
              </div>
            )}

            {/* Store Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Toko</label>
                <Input
                  value={scannedData.storeName}
                  onChange={(e) => updateScannedData("storeName", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tanggal</label>
                <Input
                  type="date"
                  value={scannedData.date}
                  onChange={(e) => updateScannedData("date", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Jumlah</label>
                <Input
                  type="number"
                  value={scannedData.totalAmount}
                  onChange={(e) => updateScannedData("totalAmount", parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mata Uang</label>
                <Input
                  value={scannedData.currency}
                  onChange={(e) => updateScannedData("currency", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Category & Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Kategori Saran</label>
              <Input
                value={scannedData.categoryName}
                onChange={(e) => updateScannedData("categoryName", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Deskripsi</label>
              <Input
                value={scannedData.description}
                onChange={(e) => updateScannedData("description", e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Items */}
            {scannedData.items.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Item yang Dibeli</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border border-border rounded-lg p-3">
                  {scannedData.items.map((item, idx) => (
                    <div key={idx} className="text-sm flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setScannedData(null);
                  setIsEditing(false);
                }}
              >
                Ubah Gambar
              </Button>
              <Button
                onClick={handleConfirm}
              >
                Gunakan Data Ini
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
