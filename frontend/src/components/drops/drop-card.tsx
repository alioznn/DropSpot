"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

import { useAuth } from "@/hooks/use-auth";
import { useDrops } from "@/hooks/use-drops";
import type { Drop } from "@/types/drop";

type DropCardProps = {
  drop: Drop;
};

const formatDate = (value: string) =>
  format(new Date(value), "d MMMM yyyy HH:mm", { locale: tr });

const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: tr,
  });

export const DropCard = ({ drop }: DropCardProps) => {
  const { user } = useAuth();
  const {
    joinWaitlist,
    leaveWaitlist,
    claimDrop,
    joinLoading,
    leaveLoading,
    claimLoading,
  } = useDrops();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<unknown>) => {
    if (!user) {
      setError("İşlem için giriş yapmalısın.");
      return;
    }
    setMessage(null);
    setError(null);
    try {
      const result = await action();
      if (typeof result === "object" && result && "claim_code" in result) {
        const claim = result as { claim_code?: string | null };
        if (typeof claim.claim_code === "string" && claim.claim_code.length > 0) {
          setClaimCode(claim.claim_code);
          setMessage("Claim kodun başarıyla üretildi.");
          return;
        }
      }
      setMessage("İşlem başarıyla tamamlandı.");
    } catch (err: unknown) {
      let detail: string | undefined;
      if (typeof err === "object" && err !== null && "data" in err) {
        const data = (err as { data?: unknown }).data;
        if (data && typeof data === "object" && "detail" in data) {
          const rawDetail = (data as Record<string, unknown>).detail;
          if (typeof rawDetail === "string") {
            detail = rawDetail;
          }
        }
      }
      setError(detail ?? "İşlem sırasında bir hata oluştu.");
    }
  };

  const isClaimWindowActive =
    new Date() >= new Date(drop.claim_window_start) &&
    new Date() <= new Date(drop.claim_window_end);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold text-slate-50">{drop.name}</h3>
            <p className="text-sm text-slate-400">
              Kapasite: <span className="font-medium">{drop.capacity}</span>
            </p>
          </div>
          <Link
            href={`/drops/${drop.id}`}
            className="text-sm text-emerald-400 transition hover:text-emerald-300"
          >
            Detaylar →
          </Link>
        </div>
        {drop.description && (
          <p className="text-sm text-slate-300">{drop.description}</p>
        )}
        <div className="grid gap-2 rounded-md border border-slate-800 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-400">
          <p>
            Claim penceresi:{" "}
            <span className="text-slate-200">
              {formatDate(drop.claim_window_start)} -{" "}
              {formatDate(drop.claim_window_end)}
            </span>
          </p>
          <p>
            Başlangıca kalan:{" "}
            <span className="text-slate-200">
              {formatRelative(drop.claim_window_start)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleAction(() => joinWaitlist(drop.id))}
            disabled={joinLoading}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {joinLoading ? "Katılıyor..." : "Bekleme Listesine Katıl"}
          </button>
          <button
            onClick={() => handleAction(() => leaveWaitlist(drop.id))}
            disabled={leaveLoading}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {leaveLoading ? "Çıkılıyor..." : "Listeden Ayrıl"}
          </button>
          <button
            onClick={() => handleAction(() => claimDrop(drop.id))}
            disabled={claimLoading || !isClaimWindowActive}
            className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {claimLoading
              ? "Kontrol ediliyor..."
              : isClaimWindowActive
              ? "Claim Hakkını Kullan"
              : "Claim Penceresi Kapalı"}
          </button>
        </div>
        {message && (
          <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {claimCode && (
          <div className="rounded-md border border-emerald-600 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-200">
            Claim kodun:{" "}
            <span className="font-mono text-lg tracking-wide">{claimCode}</span>
          </div>
        )}
      </div>
    </div>
  );
};

