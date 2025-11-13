"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

import { DropForm } from "@/components/admin/drop-form";
import { DropTable } from "@/components/admin/drop-table";
import { useAuth } from "@/hooks/use-auth";
import { useAdminDrops } from "@/hooks/use-admin-drops";
import type { Drop } from "@/types/drop";
import type { DropFormValues } from "@/types/admin";

export default function AdminPage() {
  const { user, initialized } = useAuth();
  const {
    listQuery,
    createDrop,
    createLoading,
    updateDrop,
    updateLoading,
    deleteDrop,
    deleteLoading,
  } = useAdminDrops();

  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (values: DropFormValues) => {
      setMessage(null);
      setError(null);
      try {
        await createDrop(values);
        setMessage("Drop başarıyla oluşturuldu.");
      } catch (err) {
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
        setError(detail ?? "Drop oluşturulurken hata oluştu.");
      }
    },
    [createDrop],
  );

  const handleUpdate = useCallback(
    async (values: DropFormValues) => {
      if (!editingDrop) return;
      setMessage(null);
      setError(null);
      try {
        await updateDrop({ id: editingDrop.id, data: values });
        setMessage("Drop başarıyla güncellendi.");
        setEditingDrop(null);
      } catch (err) {
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
        setError(detail ?? "Drop güncellenirken hata oluştu.");
      }
    },
    [editingDrop, updateDrop],
  );

  const handleDelete = useCallback(
    async (drop: Drop) => {
      setMessage(null);
      setError(null);
      try {
        await deleteDrop(drop.id);
        setMessage(`${drop.name} drop'u silindi.`);
        if (editingDrop?.id === drop.id) {
          setEditingDrop(null);
        }
      } catch (err) {
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
        setError(detail ?? "Drop silinirken hata oluştu.");
      }
    },
    [deleteDrop, editingDrop],
  );

  const isAdmin = useMemo(() => user?.is_admin ?? false, [user]);

  if (!initialized) {
    return (
      <p className="rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        Kullanıcı bilgileri yükleniyor...
      </p>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-6 py-6 text-center text-sm text-amber-200">
        <p>Admin paneline erişebilmek için admin yetkisine sahip olmalısın.</p>
        {!user ? (
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Giriş yap
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Kayıt ol
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-300">
            Lütfen admin hakları için yetkili kişiyle iletişime geçin.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Admin Drop Yönetimi
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Drop ekleyebilir, düzenleyebilir veya silebilirsin. Claim penceresi,
          kapasite ve drop durumlarını burada kontrol et.
        </p>
      </header>
      <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            {editingDrop ? "Drop Güncelle" : "Yeni Drop Oluştur"}
          </h2>
          {editingDrop && (
            <button
              onClick={() => setEditingDrop(null)}
              className="text-sm text-emerald-400 transition hover:text-emerald-300"
            >
              Yeni drop oluştur
            </button>
          )}
        </div>
        <DropForm
          onSubmit={editingDrop ? handleUpdate : handleCreate}
          initialValues={editingDrop ?? undefined}
          loading={createLoading || updateLoading}
          submitLabel={editingDrop ? "Güncelle" : "Oluştur"}
        />
      </section>
      {message && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Mevcut Drop&apos;lar</h2>
        <DropTable
          drops={listQuery.data}
          onEdit={setEditingDrop}
          onDelete={handleDelete}
          loading={listQuery.isLoading || deleteLoading}
        />
      </section>
    </div>
  );
}

