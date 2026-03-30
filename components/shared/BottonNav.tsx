"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  Wallet,
  BarChart2,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTransactionForm } from "@/lib/context/transaction-form-context";

const NAV_ITEMS_LEFT = [
  { href: "/dashboard",    label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi",  icon: ArrowLeftRight },
];

const NAV_ITEMS_RIGHT = [
  { href: "/categories",   label: "Kategori",   icon: Tag },
  { href: "/budgets",      label: "Budget",     icon: Wallet },
  { href: "/reports",      label: "Laporan",    icon: BarChart2 },
];

const ALL_NAV_ITEMS = [...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { setOpen } = useTransactionForm();

  useEffect(() => {
    setIsHydrated(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ? { email: data.user.email || "" } : null);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (pathname.startsWith("/auth") || pathname === "/") {
    return null;
  }

  return (
    <>
      {/* ── TOP NAVBAR — desktop only (md+) ── */}
      <nav className="hidden md:flex sticky top-0 z-50 w-full bg-card border-b border-border">
        <div className="px-4 h-16 flex items-center justify-between max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              💰
            </div>
            <span className="font-bold text-lg">FinFlow</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8">
            {ALL_NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  pathname === href
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          {isHydrated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                  <span className="ml-2 truncate max-w-32">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>

      {/* ── BOTTOM NAVBAR — mobile only (< md) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
        <div className="flex items-center justify-around h-16 px-2 relative">

          {/* Left items */}
          {NAV_ITEMS_LEFT.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <NavItem key={href} href={href} icon={<Icon className="w-5 h-5" />} label={label} active={isActive} />
            );
          })}

          {/* FAB gap */}
          <div className="w-16 shrink-0" />

          {/* Right items */}
          {NAV_ITEMS_RIGHT.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <NavItem key={href} href={href} icon={<Icon className="w-5 h-5" />} label={label} active={isActive} />
            );
          })}

          {/* FAB button — buka TransactionForm bottom sheet */}
          <button
            onClick={() => setOpen(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-[#0F172A] shadow-xl flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all z-10"
            aria-label="Tambah transaksi"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-colors group"
    >
      <span className={`transition-colors ${active ? "text-[#0F172A]" : "text-slate-400 group-hover:text-slate-600"}`}>
        {icon}
      </span>
      <span className={`text-[10px] leading-none font-medium transition-colors ${active ? "text-[#0F172A]" : "text-slate-400 group-hover:text-slate-600"}`}>
        {label}
      </span>
      {active && <span className="w-1 h-1 rounded-full bg-[#0F172A]" />}
    </Link>
  );
}