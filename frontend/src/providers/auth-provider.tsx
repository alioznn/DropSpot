"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { setAccessToken } from "@/lib/api-client";
import { loginRequest, signupRequest } from "@/lib/auth";
import type { AuthCredentials, AuthResponse, AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  initialized: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<AuthUser>;
  signup: (credentials: AuthCredentials) => Promise<AuthUser>;
  logout: () => void;
};

const STORAGE_KEY = "dropspot_auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          token?: string;
          user?: AuthUser;
        };
        if (parsed.token && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
          setAccessToken(parsed.token);
        }
      } catch (error) {
        console.warn("Failed to parse stored auth payload", error);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitialized(true);
  }, []);

  const persistAuth = useCallback((payload: AuthResponse) => {
    const nextToken = payload.token.access_token;
    const nextUser = payload.user;
    setUser(nextUser);
    setToken(nextToken);
    setAccessToken(nextToken);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextToken, user: nextUser }),
      );
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      try {
        const response = await loginRequest(credentials);
        persistAuth(response);
        return response.user;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth],
  );

  const signup = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      try {
        const response = await signupRequest(credentials);
        persistAuth(response);
        return response.user;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
    queryClient.clear();
  }, [clearAuth, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initialized,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, token, initialized, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

