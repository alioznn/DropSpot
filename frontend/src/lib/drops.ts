import apiClient from "@/lib/api-client";
import type {
  ClaimResponse,
  Drop,
  WaitlistLeaveResponse,
  WaitlistResponse,
} from "@/types/drop";

export const fetchDrops = async (): Promise<Drop[]> => {
  const response = await apiClient.get<Drop[]>("/drops");
  return response.data;
};

export const joinWaitlist = async (dropId: number): Promise<WaitlistResponse> => {
  const response = await apiClient.post<WaitlistResponse>(`/drops/${dropId}/join`);
  return response.data;
};

export const leaveWaitlist = async (
  dropId: number,
): Promise<WaitlistLeaveResponse> => {
  const response = await apiClient.post<WaitlistLeaveResponse>(`/drops/${dropId}/leave`);
  return response.data;
};

export const claimDrop = async (dropId: number): Promise<ClaimResponse> => {
  const response = await apiClient.post<ClaimResponse>(`/drops/${dropId}/claim`);
  return response.data;
};

