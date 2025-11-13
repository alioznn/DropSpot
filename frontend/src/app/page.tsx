import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        DropSpot&apos;a Hoş Geldin
      </h1>
      <p className="max-w-2xl text-lg text-slate-300">
        Backend API ile konuşan React Query destekli arayüzü adım adım
        oluşturuyoruz. Şimdi giriş yapabilir, kayıt olabilir ya da admin paneli
        ile drop yönetimini keşfedebilirsin.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-md bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Giriş Yap
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Kayıt Ol
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Admin Paneli
        </Link>
      </div>
      <p className="text-sm text-slate-500">
        API tabanı:{" "}
        <code className="font-mono">
          {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api"}
        </code>
      </p>
    </section>
  );
}
