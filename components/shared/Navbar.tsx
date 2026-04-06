"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LogOut,
  Settings,
  User,
  ReceiptText,
  Tag,
  Wallet,
  BarChart2,
  Plus,
  ChevronDown,
  Search,
  House,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import TransactionFormContent from "@/components/TransactionForm";

const NAV_ITEMS_LEFT = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/budgets", label: "Budget", icon: Wallet },
];

const NAV_ITEMS_RIGHT = [
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/reports", label: "Laporan", icon: ReceiptText  },
];

const ALL_NAV_ITEMS = [...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  if (pathname.startsWith("/auth") || pathname === "/") return null;

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <header
        className="md:hidden sticky top-0 z-50 px-4 pt-6 pb-4"
        style={{
          background:
            "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)",
        }}
      >
        <div className="flex items-center justify-between max-w-sm mx-auto">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shadow-sm">
              <span className="text-amber-400 text-xs font-extrabold">F</span>
            </div>
            <span className="text-gray-900 font-extrabold text-sm tracking-wide">
              FinTrack
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition">
              <Search className="w-4 h-4 text-gray-900" />
            </button>
            <Link
              href="/settings"
              className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition"
            >
              <Settings className="w-4 h-4 text-gray-900" />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= DESKTOP NAV ================= */}
      <nav
        className="hidden md:flex sticky top-0 z-50"
        style={{
          background:
            "linear-gradient(135deg, #F5A623 0%, #F7B733 60%, #FCCD5A 100%)",
        }}
      >
        <div className="px-6 h-14 flex items-center justify-between max-w-7xl mx-auto w-full">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">F</span>
            </div>
            <span className="font-semibold text-sm text-gray-900">
              FinTrack
            </span>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-1">
            {ALL_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition ${
                    isActive
                      ? "bg-gray-900 text-amber-400 shadow"
                      : "text-gray-800/70 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Add */}
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-gray-900 text-amber-400 hover:opacity-90 transition">
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </button>
              </DrawerTrigger>

              <DrawerContent className="h-[90vh] rounded-t-3xl flex flex-col max-w-sm mx-auto">
                <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-slate-300" />
                <DrawerHeader>
                  <DrawerTitle>Tambah Transaksi</DrawerTitle>
                  <DrawerDescription className="sr-only" />
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto">
                  <TransactionFormContent onSuccess={() => setOpen(false)} />
                </div>
              </DrawerContent>
            </Drawer>

            {/* User */}
            {isHydrated && user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-900"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-xs truncate max-w-32">
                    {user.email}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50"
                      >
                        <Settings className="w-4 h-4 text-amber-500" />
                        Pengaturan
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-amber-100">
        <div className="flex items-center justify-around h-16 px-2 relative max-w-sm mx-auto">

          {NAV_ITEMS_LEFT.map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          <div className="w-16" />

          {NAV_ITEMS_RIGHT.map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          {/* FAB */}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-gray-900 shadow-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-amber-400" />
              </button>
            </DrawerTrigger>

            <DrawerContent className="h-[90vh] rounded-t-3xl flex flex-col">
              <DrawerHeader>
                <DrawerTitle>Tambah Transaksi</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto">
                <TransactionFormContent onSuccess={() => setOpen(false)} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </>
  );
}

function NavItem({ href, icon: Icon, label, active }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 flex-1"
    >
      <Icon
        className={`w-5 h-5 ${
          active ? "text-amber-500" : "text-gray-400"
        }`}
      />
      <span
        className={`text-[10px] ${
          active ? "text-amber-600 font-bold" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}