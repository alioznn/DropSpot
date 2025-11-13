"use client";

import { useMemo } from "react";

import { useDrops } from "@/hooks/use-drops";
import { DropCard } from "./drop-card";

export const DropList = () => {
  const { dropsQuery } = useDrops();

  const content = useMemo(() => {
    if (dropsQuery.isLoading) {
      return (
        <p className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-4 text-center text-sm text-slate-400">
          Drop listesi yükleniyor...
        </p>
      );
    }
    if (dropsQuery.isError) {
      return (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-4 text-center text-sm text-red-300">
          Drop listesi yüklenirken bir hata oluştu.
        </p>
      );
    }
    if (!dropsQuery.data || dropsQuery.data.length === 0) {
      return (
        <p className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-4 text-center text-sm text-slate-400">
          Şu anda aktif drop bulunmuyor.
        </p>
      );
    }
    return dropsQuery.data.map((drop) => <DropCard key={drop.id} drop={drop} />);
  }, [dropsQuery]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {content}
    </div>
  );
};

