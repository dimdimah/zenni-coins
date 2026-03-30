"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";

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

        if (!data?.user) {
          router.push("/auth/login");
        } else {
          setUser({ email: data.user.email || "" });
        }
      } catch {
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Minimal 6 karakter",
        variant: "destructive",
      });
      return;
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
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-amber-700 text-sm font-medium">
            Memuat pengaturan...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const username = user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* HEADER */}
      <div
        className="px-5 pt-7 pb-8 md:rounded-b-3xl"
        style={{
          background:
            "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-gray-900 text-xl font-extrabold">
            Pengaturan
          </h1>
          <p className="text-amber-900/60 text-xs mt-1">
            Kelola akun kamu, {username}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-4">
        {/* ACCOUNT CARD */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <p className="text-gray-800 font-bold text-sm mb-3">
            Informasi Akun
          </p>

          <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
            <Mail className="w-4 h-4 text-amber-600" />
            <span className="text-gray-800 text-sm font-semibold truncate">
              {user.email}
            </span>
          </div>
        </div>

        {/* PASSWORD CARD */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <p className="text-gray-800 font-bold text-sm mb-3">
            Ubah Password
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3">
            {/* NEW PASSWORD */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 bg-amber-50 border-amber-200 focus:ring-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-amber-50 border-amber-200 focus:ring-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-gray-900 text-amber-400 hover:bg-gray-800 font-bold rounded-xl"
            >
              {isChangingPassword && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isChangingPassword ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-200">
          <p className="text-red-500 font-bold text-sm mb-2">
            Zona Berbahaya
          </p>
          <p className="text-gray-400 text-xs mb-3">
            Tindakan ini tidak dapat dibatalkan
          </p>

          <Button
            disabled
            className="w-full bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold"
          >
            Hapus Akun (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}