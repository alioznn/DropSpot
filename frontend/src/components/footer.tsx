"use client";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/70 bg-slate-950/80">
      <div className="container mx-auto flex flex-col gap-2 px-6 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} DropSpot • Sınırlı drop&apos;lar için adil
          bekleme listesi deneyimi.
        </p>
        <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-slate-500">
          <span>Seed powered priority</span>
          <span className="h-4 w-px bg-slate-700" />
          <span>Pozitif kullanıcı deneyimi</span>
        </div>
      </div>
    </footer>
  );
};

