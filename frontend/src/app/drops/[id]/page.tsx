"use client";

import Link from "next/link";

import { DropDetail } from "@/components/drops/drop-detail";

export default function DropDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/drops"
          className="text-sm text-emerald-400 transition hover:text-emerald-300"
        >
          ← Drop listesine dön
        </Link>
      </div>
      <DropDetail />
    </div>
  );
}

