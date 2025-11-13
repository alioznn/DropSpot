export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        DropSpot Frontend
      </h1>
      <p className="max-w-2xl text-lg text-slate-300">
        React Query destekli Next.js arayüzü için temel kurulum tamamlandı.
        Auth, drop listeleme ve admin paneli modüllerini adım adım ekleyeceğiz.
      </p>
      <div className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-md">
        <p>
          Başlamak için navigation ve sayfaları oluşturacağız. API tabanı{" "}
          <code className="font-mono">
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api"}
          </code>
          .
        </p>
      </div>
    </main>
  );
}
