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
  Plus,
  ChevronDown,
  House,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import TransactionFormContent from "@/components/TransactionForm";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/budgets", label: "Budget", icon: Wallet },
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/reports", label: "Laporan", icon: ReceiptText },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<{ email: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
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
      {/* ===== MOBILE HEADER ===== */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white border-b">
        <Link href="/dashboard" className="font-semibold text-gray-900">
          FinTrack
        </Link>

        <Link
          href="/settings"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </header>

      {/* ===== DESKTOP NAV ===== */}
      <nav className="hidden md:flex sticky top-0 z-50 h-14 bg-white border-b">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="font-semibold text-gray-900">
            FinTrack
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition",
                    active
                      ? "bg-amber-100 text-amber-600"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Add */}
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:opacity-90 active:scale-95 transition">
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </DrawerTrigger>

              <DrawerContent className="h-[90vh] rounded-t-3xl flex flex-col">
                <div className="mx-auto mt-3 mb-2 h-1.5 w-12 bg-gray-300 rounded-full" />
                <DrawerHeader>
                  <DrawerTitle>Tambah Transaksi</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto">
                  <TransactionFormContent onSuccess={() => setOpen(false)} />
                </div>
              </DrawerContent>
            </Drawer>

            {/* User */}
            {user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen((v) => !v);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border bg-white hover:bg-gray-50"
                >
                  <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>

                  <span className="truncate max-w-28 text-xs text-gray-600">
                    {user.email}
                  </span>

                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Pengaturan
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
        <div className="flex items-center justify-around h-16 relative max-w-sm mx-auto">

          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          <div className="w-16" />

          {NAV_ITEMS.slice(2).map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          {/* FAB */}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-amber-400 text-black shadow-lg flex items-center justify-center active:scale-95 transition">
                <Plus className="w-6 h-6" />
              </button>
            </DrawerTrigger>

            <DrawerContent className="h-[90vh] rounded-t-3xl flex flex-col">
              <div className="mx-auto mt-3 mb-2 h-1.5 w-12 bg-gray-300 rounded-full" />
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

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-xs">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center
        ${active ? "bg-amber-100" : ""}`}
      >
        <Icon
          className={`w-4 h-4 ${
            active ? "text-amber-600" : "text-gray-400"
          }`}
        />
      </div>

      <span
        className={`text-[10px] ${
          active ? "text-amber-600 font-medium" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}