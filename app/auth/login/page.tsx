"use client";
 
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";
 
const glassInput =
  "rounded-xl border-0 bg-white/60 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 placeholder:text-gray-400";
 
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      router.push("/dashboard");
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan, silakan coba lagi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleOAuthLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan, silakan coba lagi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 40%, #dbeafe 100%)" }}
    >
      {/* Blobs */}
      <div className="pointer-events-none fixed -top-24 -right-24 w-96 h-96 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)" }} />
      <div className="pointer-events-none fixed -bottom-32 -left-20 w-80 h-80 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #c4b5fd 0%, transparent 70%)" }} />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }} />
 
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-8 relative z-10"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.85)",
          boxShadow: "0 20px 60px rgba(99,102,241,0.12), 0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
            }}
          >
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Masuk ke FinTrack</h1>
          <p className="text-gray-400 text-xs mt-1">Kelola keuangan kamu dengan lebih baik</p>
        </div>
 
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <Input
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${glassInput} pl-10`}
                required
              />
            </div>
          </div>
 
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${glassInput} pl-10`}
                required
              />
            </div>
          </div>
 
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            }}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Masuk..." : "Masuk"}
          </button>
        </form>
 
        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
          <span className="text-xs text-gray-400">atau</span>
          <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
        </div>
 
        <button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
          className="w-full py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition hover:bg-white/80 disabled:opacity-60"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "#374151",
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </button>
 
        <p className="text-center text-xs text-gray-400 mt-5">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-indigo-500 font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}