"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { LiveBroadcast, SortType } from "@/domains/live/types";

interface UseLiveListParams {
  category?: string;
  order?: SortType;
}

async function fetchPage(
  category: string | undefined,
  order: SortType,
  page: number,
): Promise<LiveBroadcast[]> {
  const query = new URLSearchParams({ order_type: order, page: String(page) });
  if (category) query.set("category", category);
  const res = await fetch(`/api/soop/broad/list?${query.toString()}`);
  const json: { list?: LiveBroadcast[] } = await res.json();
  return json.list ?? [];
}

export function useLiveList({
  category,
  order = "view_cnt",
}: UseLiveListParams = {}) {
  const query = useInfiniteQuery({
    queryKey: ["live-list", category ?? null, order],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(category, order, pageParam),
    // SOOP 페이지 크기가 가변이라 "빈 페이지 = 끝"이 가장 안전한 종료 조건.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 0 ? undefined : allPages.length + 1,
    refetchInterval: 30_000, // 기존 SWR refreshInterval 동작 보존
  });

  // 페이지를 평탄화하면서 bjId-broadNo 기준으로 중복 제거(SOOP 페이지 간 중복 가능).
  const seen = new Set<string>();
  const broadcasts: LiveBroadcast[] = [];
  for (const page of query.data?.pages ?? []) {
    for (const b of page) {
      const key = `${b.bjId}-${b.broadNo}`;
      if (!seen.has(key)) {
        seen.add(key);
        broadcasts.push(b);
      }
    }
  }

  return {
    broadcasts,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  };
}
