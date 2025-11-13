import { AuthCredentials, AuthResponse } from "@/types/auth";
import apiClient from "./api-client";

export const loginRequest = async (
  credentials: AuthCredentials,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials,
  );
  return response.data;
};

export const signupRequest = async (
  credentials: AuthCredentials,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/signup",
    credentials,
  );
  return response.data;
};

