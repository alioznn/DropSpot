"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useDrops } from "@/hooks/use-drops";
import { DropCard } from "./drop-card";

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
      <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Geçersiz drop kimliği.
      </div>
    );
  }

  if (dropsQuery.isLoading) {
    return (
      <p className="rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        Drop detayları yükleniyor...
      </p>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-4 text-center text-sm text-red-300">
        <p>Aradığın drop bulunamadı.</p>
        <Link
          href="/drops"
          className="text-emerald-400 transition hover:text-emerald-300"
        >
          Drop listesine geri dön →
        </Link>
      </div>
    );
  }

  const drop = getDropById(id);
  if (!drop) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-50">{drop.name}</h1>
          {drop.description && (
            <p className="text-slate-300">{drop.description}</p>
          )}
          <dl className="grid gap-3 rounded-md border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Kapasite</dt>
              <dd className="text-slate-100">{drop.capacity}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Claim Penceresi</dt>
              <dd className="text-slate-100">
                {formatDate(drop.claim_window_start)} -{" "}
                {formatDate(drop.claim_window_end)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Başlangıca Kalan</dt>
              <dd className="text-slate-100">
                {formatDistanceToNow(new Date(drop.claim_window_start), {
                  addSuffix: true,
                  locale: tr,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Durum</dt>
              <dd className="text-slate-100">
                {drop.is_active ? "Aktif" : "Pasif"}
              </dd>
            </div>
          </dl>
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

