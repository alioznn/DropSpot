"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const { login, signup, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const action = isLogin ? login : signup;
      await action({ email, password });
      router.push("/");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "detail" in err.data
      ) {
        const detail = (err.data as { detail?: string }).detail;
        setError(detail ?? "Beklenmeyen bir hata oluştu.");
      } else {
        setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <div className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2 text-left">
          <label htmlFor="email" className="text-sm font-medium text-slate-200">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="dev@example.com"
          />
        </div>
        <div className="space-y-2 text-left">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-200"
          >
            Parola
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="En az 8 karakter"
          />
        </div>
        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Gönderiliyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        {isLogin ? (
          <>
            Hesabın yok mu?{" "}
            <Link
              href="/signup"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Kayıt ol
            </Link>
          </>
        ) : (
          <>
            Zaten üye misin?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Giriş yap
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

