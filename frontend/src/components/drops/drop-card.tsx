"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { useAuth } from "@/hooks/use-auth";
import { useDrops } from "@/hooks/use-drops";
import type { Drop, WaitlistResponse } from "@/types/drop";
import { Alert } from "@/components/ui/alert";
import { formatRemainingTime, getClaimWindowStatus } from "@/lib/datetime";

type DropCardProps = {
  drop: Drop;
};

const formatDate = (value: string) =>
  format(new Date(value), "d MMMM yyyy HH:mm", { locale: tr });

type FeedbackState = {
  variant: "success" | "warning" | "error" | "info";
  title?: string;
  description: string;
};

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
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);

  const claimStatus = getClaimWindowStatus(
    drop.claim_window_start,
    drop.claim_window_end,
  );

  const now = Date.now();
  const claimEnd = new Date(drop.claim_window_end).getTime();
  const canJoin = Number.isNaN(claimEnd) ? true : now < claimEnd;

  const requireAuth = () => {
    if (!user) {
      setFeedback({
        variant: "warning",
        title: "⚠ Giriş yapmalısın",
        description:
          "Bekleme listesine katılmak veya claim hakkını kullanmak için önce giriş yap.",
      });
      return false;
    }
    return true;
  };

  const handleError = (err: unknown, fallback: string) => {
    let detail: string | undefined;
    if (
      typeof err === "object" &&
      err !== null &&
      "data" in err &&
      err.data &&
      typeof err.data === "object" &&
      "detail" in err.data &&
      typeof err.data.detail === "string"
    ) {
      detail = err.data.detail;
    }
    setFeedback({
      variant: "error",
      title: "❌ Bir sorun oluştu",
      description: detail ?? fallback,
    });
  };

  const handleJoin = async () => {
    if (!requireAuth()) return;
    if (!canJoin) {
      setFeedback({
        variant: "warning",
        title: "⏳ Kapı kapandı",
        description:
          "Bu drop'un claim penceresi sona erdi. Yeni drop'ları takip etmeyi unutma!",
      });
      return;
    }
    setFeedback(null);
    setClaimCode(null);
    try {
      const result = (await joinWaitlist(drop.id)) as WaitlistResponse | undefined;
      const entry = result?.entry;
      const score =
        entry && typeof entry.priority_score === "number"
          ? entry.priority_score.toFixed(2)
        : "—";
      setFeedback({
        variant: "success",
        title: "🎉 Bekleme listesindesin!",
        description: `Öncelik puanın ${score}. Claim penceresi açıldığında sıran geldiğinde bildirim alacaksın.`,
      });
    } catch (err) {
      handleError(err, "Bekleme listesine katılırken bir hata oluştu.");
    }
  };

  const handleLeave = async () => {
    if (!requireAuth()) return;
    setFeedback(null);
    setClaimCode(null);
    try {
      await leaveWaitlist(drop.id);
      setFeedback({
        variant: "info",
        title: "ℹ Bekleme listesinden ayrıldın",
        description: "Vazgeçtin mi? Dilediğin zaman yeniden katılabilirsin.",
      });
    } catch (err) {
      handleError(err, "Bekleme listesinden çıkarken bir hata oluştu.");
    }
  };

  const handleClaim = async () => {
    if (!requireAuth()) return;
    setFeedback(null);
    try {
      const result = await claimDrop(drop.id);
      setClaimCode(result.claim_code);
      setFeedback({
        variant: "success",
        title: "✨ Claim hakkın hazır!",
        description:
          "Aşağıdaki kodu güvenle sakla ve sadece DropSpot içindeki satın alma adımında kullan.",
      });
    } catch (err) {
      handleError(err, "Claim kodu alınırken bir hata oluştu.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-slate-950/40 transition hover:border-emerald-500/40 hover:shadow-emerald-900/30">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold text-slate-50 drop-shadow">
              {drop.name}
            </h3>
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">
              Kapasite{" "}
              <span className="font-semibold text-emerald-100">
                {drop.capacity}
              </span>
            </p>
          </div>
          <Link
            href={`/drops/${drop.id}`}
            className="rounded-full border border-emerald-500/40 px-4 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
          >
            Detaylar
          </Link>
        </div>
        {drop.description && (
          <p className="rounded-xl bg-slate-900/70 px-4 py-3 text-sm leading-relaxed text-slate-200 shadow-inner shadow-black/20">
            {drop.description}
          </p>
        )}
        <div className="grid gap-3 rounded-xl border border-slate-800/80 bg-slate-950/70 px-4 py-4 text-sm text-slate-300">
          <p>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Claim penceresi
            </span>
            <br />
            <span className="text-slate-100">
              {formatDate(drop.claim_window_start)}
            </span>
            <span className="text-slate-500"> → </span>
            <span className="text-slate-100">
              {formatDate(drop.claim_window_end)}
            </span>
          </p>
          <p>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Kalan süre
            </span>
            <br />
            <span className="text-slate-100">
              {claimStatus.active
                ? formatRemainingTime(drop.claim_window_end)
                : formatRemainingTime(drop.claim_window_start)}
            </span>
          </p>
        </div>
        <Alert variant={claimStatus.variant} description={claimStatus.label} />
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleJoin}
            disabled={joinLoading || !canJoin}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-900/30 transition hover:translate-y-px hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joinLoading
              ? "Katılıyor..."
              : canJoin
              ? "Bekleme Listesine Katıl"
              : "Katılım Kapalı"}
          </button>
          <button
            onClick={handleLeave}
            disabled={leaveLoading}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {leaveLoading ? "Çıkılıyor..." : "Listeden Ayrıl"}
          </button>
          <button
            onClick={handleClaim}
            disabled={claimLoading || !claimStatus.active}
            className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {claimLoading
              ? "Kontrol ediliyor..."
              : claimStatus.active
              ? "Claim Hakkını Kullan"
              : "Claim Penceresi Kapalı"}
          </button>
        </div>
        {feedback && (
          <Alert
            variant={feedback.variant}
            title={feedback.title}
            description={feedback.description}
          />
        )}
        {claimCode && (
          <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-600/20 via-emerald-500/15 to-emerald-500/10 px-5 py-4 text-center text-sm text-emerald-50 shadow-lg shadow-emerald-900/30">
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">
              Claim kodun
            </p>
            <p className="mt-2 font-mono text-2xl tracking-widest text-emerald-100">
              {claimCode}
            </p>
            <p className="mt-2 text-xs text-emerald-100/80">
              Kodunu güvenle sakla ve sadece DropSpot içindeki satın alma
              adımında kullan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
