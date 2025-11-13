"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminDrop,
  deleteAdminDrop,
  fetchAdminDrops,
  updateAdminDrop,
} from "@/lib/admin";
import type { Drop } from "@/types/drop";
import type { DropFormValues } from "@/types/admin";

const ADMIN_DROPS_KEY = ["admin", "drops"];

export const useAdminDrops = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ADMIN_DROPS_KEY,
    queryFn: fetchAdminDrops,
  });

  const createMutation = useMutation({
    mutationFn: (payload: DropFormValues) => createAdminDrop(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Drop[]>(ADMIN_DROPS_KEY, (old) =>
        old ? [created, ...old] : [created],
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: number; data: Partial<DropFormValues> }) =>
      updateAdminDrop(variables.id, variables.data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Drop[]>(ADMIN_DROPS_KEY, (old) =>
        old ? old.map((drop) => (drop.id === updated.id ? updated : drop)) : [updated],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dropId: number) => deleteAdminDrop(dropId),
    onSuccess: (_, dropId) => {
      queryClient.setQueryData<Drop[]>(ADMIN_DROPS_KEY, (old) =>
        old ? old.filter((drop) => drop.id !== dropId) : [],
      );
    },
  });

  return useMemo(
    () => ({
      listQuery,
      createDrop: createMutation.mutateAsync,
      createLoading: createMutation.isLoading,
      updateDrop: updateMutation.mutateAsync,
      updateLoading: updateMutation.isLoading,
      deleteDrop: deleteMutation.mutateAsync,
      deleteLoading: deleteMutation.isLoading,
    }),
    [
      listQuery,
      createMutation.mutateAsync,
      createMutation.isLoading,
      updateMutation.mutateAsync,
      updateMutation.isLoading,
      deleteMutation.mutateAsync,
      deleteMutation.isLoading,
    ],
  );
};

