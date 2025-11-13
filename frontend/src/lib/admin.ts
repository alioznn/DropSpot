import apiClient from "@/lib/api-client";
import type { DropFormValues } from "@/types/admin";
import type { Drop } from "@/types/drop";

export const fetchAdminDrops = async (): Promise<Drop[]> => {
  const response = await apiClient.get<Drop[]>("/admin/drops");
  return response.data;
};

export const createAdminDrop = async (
  payload: DropFormValues,
): Promise<Drop> => {
  const response = await apiClient.post<Drop>("/admin/drops", payload);
  return response.data;
};

export const updateAdminDrop = async (
  dropId: number,
  payload: Partial<DropFormValues>,
): Promise<Drop> => {
  const response = await apiClient.put<Drop>(`/admin/drops/${dropId}`, payload);
  return response.data;
};

export const deleteAdminDrop = async (dropId: number): Promise<void> => {
  await apiClient.delete(`/admin/drops/${dropId}`);
};

