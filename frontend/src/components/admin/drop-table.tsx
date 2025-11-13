"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import type { Drop } from "@/types/drop";

type DropTableProps = {
  drops: Drop[] | undefined;
  onEdit: (drop: Drop) => void;
  onDelete: (drop: Drop) => void;
  loading?: boolean;
};

const formatDate = (value: string) =>
  format(new Date(value), "d MMM yyyy HH:mm", { locale: tr });

export const DropTable = ({
  drops,
  onEdit,
  onDelete,
  loading = false,
}: DropTableProps) => {
  const sorted = useMemo(() => {
    if (!drops) return [];
    return [...drops].sort(
      (a, b) =>
        new Date(a.claim_window_start).getTime() -
        new Date(b.claim_window_start).getTime(),
    );
  }, [drops]);

  if (loading) {
    return (
      <p className="rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        Drop listesi yükleniyor...
      </p>
    );
  }

  if (!sorted.length) {
    return (
      <p className="rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        Yönetilecek drop bulunamadı.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 shadow-md">
      <table className="min-w-full divide-y divide-slate-800 bg-slate-950 text-sm">
        <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Ad</th>
            <th className="px-4 py-3 text-left">Kapasite</th>
            <th className="px-4 py-3 text-left">Claim Penceresi</th>
            <th className="px-4 py-3 text-left">Durum</th>
            <th className="px-4 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {sorted.map((drop) => (
            <tr key={drop.id}>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <p className="font-medium">{drop.name}</p>
                  {drop.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {drop.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">{drop.capacity}</td>
              <td className="px-4 py-3 text-xs text-slate-300">
                <div>{formatDate(drop.claim_window_start)}</div>
                <div className="text-slate-500">
                  {formatDate(drop.claim_window_end)}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    drop.is_active
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {drop.is_active ? "Aktif" : "Pasif"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(drop)}
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => onDelete(drop)}
                    className="rounded-md border border-red-600/70 px-3 py-1 text-xs text-red-300 transition hover:bg-red-600/10"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

