"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { DropFormValues } from "@/types/admin";
import type { Drop } from "@/types/drop";

type DropFormProps = {
  onSubmit: (values: DropFormValues) => Promise<void>;
  initialValues?: Drop;
  loading?: boolean;
  submitLabel?: string;
};

const defaultValues: DropFormValues = {
  name: "",
  description: "",
  capacity: 1,
  claim_window_start: "",
  claim_window_end: "",
  is_active: true,
};

export const DropForm = ({
  onSubmit,
  initialValues,
  loading = false,
  submitLabel = "Kaydet",
}: DropFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DropFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name,
        description: initialValues.description ?? "",
        capacity: initialValues.capacity,
        claim_window_start: initialValues.claim_window_start.slice(0, 16),
        claim_window_end: initialValues.claim_window_end.slice(0, 16),
        is_active: initialValues.is_active,
      });
    } else {
      reset(defaultValues);
    }
  }, [initialValues, reset]);

  const onSubmitHandler = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      claim_window_start: new Date(values.claim_window_start).toISOString(),
      claim_window_end: new Date(values.claim_window_end).toISOString(),
    });
    if (!initialValues) {
      reset(defaultValues);
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmitHandler}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 text-left">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Drop adı
          </label>
          <input
            {...register("name", { required: "Bu alan zorunludur." })}
            placeholder="Drop adı"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1 text-left">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Kapasite
          </label>
          <input
            type="number"
            min={1}
            {...register("capacity", {
              valueAsNumber: true,
              min: { value: 1, message: "Kapasite 1 den büyük olmalı." },
              required: "Bu alan zorunludur.",
            })}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.capacity && (
            <p className="text-xs text-red-400">{errors.capacity.message}</p>
          )}
        </div>
        <div className="space-y-1 text-left">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Claim başlangıcı
          </label>
          <input
            type="datetime-local"
            {...register("claim_window_start", {
              required: "Bu alan zorunludur.",
            })}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.claim_window_start && (
            <p className="text-xs text-red-400">
              {errors.claim_window_start.message}
            </p>
          )}
        </div>
        <div className="space-y-1 text-left">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Claim bitişi
          </label>
          <input
            type="datetime-local"
            {...register("claim_window_end", {
              required: "Bu alan zorunludur.",
            })}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.claim_window_end && (
            <p className="text-xs text-red-400">
              {errors.claim_window_end.message}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1 text-left">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Açıklama
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Drop açıklaması (opsiyonel)"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          {...register("is_active")}
          className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
        />
        <label htmlFor="is_active" className="text-sm text-slate-300">
          Drop aktif
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Kaydediliyor..." : submitLabel}
      </button>
    </form>
  );
};

