"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useDrops } from "@/hooks/use-drops";
import { DropCard } from "./drop-card";
import { Alert } from "@/components/ui/alert";
import { formatRemainingTime, getClaimWindowStatus } from "@/lib/datetime";

const formatDate = (value: string) =>
  format(new Date(value), "d MMMM yyyy HH:mm", { locale: tr });

export const DropDetail = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { dropsQuery, getDropById } = useDrops();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!dropsQuery.isLoading && !dropsQuery.data?.some((drop) => drop.id === id)) {
      setNotFound(true);
    }
  }, [dropsQuery.isLoading, dropsQuery.data, id]);

  if (Number.isNaN(id)) {
    return (
      <Alert
        variant="error"
        description="Geçersiz drop kimliği."
        className="text-sm"
      />
    );
  }

  if (dropsQuery.isLoading) {
    return (
      <Alert
        variant="info"
        description="Drop detayları yükleniyor..."
        className="text-sm"
      />
    );
  }

  if (notFound) {
    return (
      <div className="space-y-3 text-center">
        <Alert
          variant="warning"
          description="Aradığın drop bulunamadı."
          className="text-sm"
        />
        <Link
          href="/drops"
          className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          Drop listesine geri dön
        </Link>
      </div>
    );
  }

  const drop = getDropById(id);
  if (!drop) {
    return null;
  }

  const claimStatus = getClaimWindowStatus(
    drop.claim_window_start,
    drop.claim_window_end,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-slate-950/40">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 drop-shadow">
              {drop.name}
            </h1>
            <p className="mt-2 text-sm text-slate-300">{drop.description}</p>
          </div>
          <div className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-5 py-4 text-sm text-slate-200 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Kapasite
              </p>
              <p className="text-lg font-semibold text-emerald-200">
                {drop.capacity}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Durum
              </p>
              <p className="text-lg font-semibold text-emerald-200">
                {drop.is_active ? "Aktif" : "Pasif"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Claim başlangıcı
              </p>
              <p className="text-slate-100">
                {formatDate(drop.claim_window_start)}
              </p>
              <p className="text-xs text-slate-500">
                Kalan: {formatRemainingTime(drop.claim_window_start)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Claim bitişi
              </p>
              <p className="text-slate-100">{formatDate(drop.claim_window_end)}</p>
              <p className="text-xs text-slate-500">
                Kalan: {formatRemainingTime(drop.claim_window_end)}
              </p>
            </div>
          </div>
          <Alert variant={claimStatus.variant} description={claimStatus.label} />
          <p className="text-xs text-slate-500">
            Oluşturulma: {formatDate(drop.created_at)} • Güncelleme:{" "}
            {formatDate(drop.updated_at)}
          </p>
        </div>
      </div>
      <DropCard drop={drop} />
    </div>
  );
};
