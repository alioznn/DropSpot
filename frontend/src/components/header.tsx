"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

export const Header = () => {
  const router = useRouter();
  const { user, logout, initialized } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          DropSpot
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/drops"
            className="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Drop Listesi
          </Link>
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Admin Paneli
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {!initialized ? (
            <span className="text-sm text-slate-400">Yükleniyor...</span>
          ) : user ? (
            <>
              <span className="text-sm text-slate-300">
                {user.email}
                {user.is_admin && (
                  <span className="ml-2 rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                    admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Giriş
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

