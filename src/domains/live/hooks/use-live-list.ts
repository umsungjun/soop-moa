"use client";

import useSWR from "swr";
import type { LiveBroadcast, SortType } from "@/domains/live/types";

interface UseLiveListParams {
  category?: string;
  order?: SortType;
  page?: number;
}

const fetcher = (url: string): Promise<{ list: LiveBroadcast[] }> =>
  fetch(url).then((res) => res.json());

export function useLiveList({
  category,
  order = "view_cnt",
  page = 1,
}: UseLiveListParams = {}) {
  const query = new URLSearchParams({ order_type: order, page: String(page) });
  if (category) query.set("category", category);

  const { data, error, isLoading } = useSWR<{ list: LiveBroadcast[] }>(
    `/api/soop/broad/list?${query.toString()}`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: false },
  );

  return {
    broadcasts: data?.list ?? [],
    isLoading,
    error,
  };
}
