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
  signal?: AbortSignal,
): Promise<LiveBroadcast[]> {
  const query = new URLSearchParams({ order_type: order, page: String(page) });
  if (category) query.set("category", category);
  // TanStack Query가 캐시 계층이므로 브라우저 HTTP 캐시는 쓰지 않는다. 라우트의 stale-while-revalidate 헤더를 브라우저가 적용하면(로컬 dev) 캐시 응답과 백그라운드 재검증 요청이 쌍으로 생겨 네트워크 탭에 요청이 2배로 보인다. 운영은 Vercel이 브라우저용 헤더를 max-age=0으로 바꿔 보내 원래 영향이 없다.
  // 쿼리가 취소되면(카테고리·정렬 변경 등) 진행 중인 네트워크 요청도 함께 중단한다.
  const res = await fetch(`/api/soop/broad/list?${query.toString()}`, {
    signal,
    cache: "no-store",
  });
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
    queryFn: ({ pageParam, signal }) =>
      fetchPage(category, order, pageParam, signal),
    // SOOP 페이지 크기가 가변이라 "빈 페이지 = 끝"이 가장 안전한 종료 조건.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 0 ? undefined : allPages.length + 1,
    // 무한 쿼리의 refetch는 불러온 모든 페이지를 다시 요청한다. 검색 자동 로드나 스크롤로 페이지를 쌓은 뒤에도 30초마다 페이지 수만큼 요청이 한꺼번에 나가지 않도록, 첫 페이지만 있을 때(대부분의 탐색 상황)에만 주기 갱신과 탭 복귀 갱신을 한다.
    refetchInterval: (q) =>
      (q.state.data?.pages.length ?? 1) <= 1 ? 30_000 : false,
    refetchOnWindowFocus: (q) => (q.state.data?.pages.length ?? 1) <= 1,
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
