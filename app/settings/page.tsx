"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  Loader2,
  ShieldAlert,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data?.user) router.push("/auth/login");
        else setUser({ email: data.user.email || "" });
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast({
        title: "Error",
        description: "Password tidak cocok",
        variant: "destructive",
      });
    }

    if (newPassword.length < 6) {
      return toast({
        title: "Error",
        description: "Minimal 6 karakter",
        variant: "destructive",
      });
    }

    setIsChangingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Password berhasil diubah",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({
        title: "Error",
        description: "Gagal mengubah password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) return null;

  const username = user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {username}
              </h1>
              <p className="text-xs text-gray-500">
                Pengaturan akun
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ACCOUNT */}
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Informasi Akun
          </p>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 truncate">
              {user.email}
            </span>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Ubah Password
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3">

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full mt-2 bg-amber-400 text-black text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90"
            >
              {isChangingPassword && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isChangingPassword ? "Menyimpan..." : "Simpan Password"}
            </button>

          </form>
        </div>

        {/* DANGER */}
        <div className="bg-white border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-red-500">
              Zona Berbahaya
            </p>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Tindakan ini tidak dapat dibatalkan
          </p>

          <button
            disabled
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-red-500 text-white opacity-60 cursor-not-allowed"
          >
            Hapus Akun (Coming Soon)
          </button>
        </div>

      </div>
    </div>
  );
}