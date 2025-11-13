"use client";

import { useCallback, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { claimDrop, fetchDrops, joinWaitlist, leaveWaitlist } from "@/lib/drops";
import type { Drop, WaitlistResponse } from "@/types/drop";

const DROPS_QUERY_KEY = ["drops"];

export const useDrops = () => {
  const queryClient = useQueryClient();

  const dropsQuery = useQuery({
    queryKey: DROPS_QUERY_KEY,
    queryFn: fetchDrops,
    staleTime: 1000 * 30,
  });

  const joinMutation = useMutation({
    mutationFn: (dropId: number) => joinWaitlist(dropId),
    onSuccess: (_, dropId) => {
      queryClient.invalidateQueries({ queryKey: DROPS_QUERY_KEY });
      queryClient.setQueryData<WaitlistResponse | undefined>(
        ["waitlist", dropId],
        (prev) => prev,
      );
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (dropId: number) => leaveWaitlist(dropId),
    onSuccess: (_, dropId) => {
      queryClient.invalidateQueries({ queryKey: DROPS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ["waitlist", dropId] });
    },
  });

  const claimMutation = useMutation({
    mutationFn: (dropId: number) => claimDrop(dropId),
  });

  const getDropById = useCallback(
    (id: number): Drop | undefined => {
      return dropsQuery.data?.find((drop) => drop.id === id);
    },
    [dropsQuery.data],
  );

  return useMemo(
    () => ({
      dropsQuery,
      joinWaitlist: joinMutation.mutateAsync,
      joinLoading: joinMutation.isLoading,
      leaveWaitlist: leaveMutation.mutateAsync,
      leaveLoading: leaveMutation.isLoading,
      claimDrop: claimMutation.mutateAsync,
      claimLoading: claimMutation.isLoading,
      getDropById,
    }),
    [
      dropsQuery,
      joinMutation.mutateAsync,
      joinMutation.isLoading,
      leaveMutation.mutateAsync,
      leaveMutation.isLoading,
      claimMutation.mutateAsync,
      claimMutation.isLoading,
      getDropById,
    ],
  );
};

