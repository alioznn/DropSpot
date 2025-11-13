"use client";

import { DropList } from "@/components/drops/drop-list";

export default function DropsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Aktif Drop&apos;lar
        </h1>
        <p className="text-sm text-slate-400">
          Bekleme listesine katıl, claim penceresi açıldığında bildirim al ve
          hakkını iddia et.
        </p>
      </header>
      <DropList />
    </div>
  );
}

