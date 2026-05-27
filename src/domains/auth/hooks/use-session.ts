"use client";

import useSWR from "swr";
import type { SessionUser } from "@/lib/session/types";

interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

const fetcher = (url: string): Promise<SessionResponse> =>
  fetch(url).then((res) => res.json());

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<SessionResponse>(
    "/api/auth/session",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 5_000 },
  );

  return {
    user: data?.user ?? null,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    error,
    mutate,
  };
}
