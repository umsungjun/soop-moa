"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { CommunityPostSummary } from "@/lib/supabase/types";
import type { PostListResponse } from "../types";

const fetchPage = async (cursor?: string): Promise<PostListResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/community/posts?${params.toString()}`);
  if (!res.ok) throw new Error("글 목록을 불러오지 못했습니다.");
  return res.json();
};

/**
 * 글 목록 무한스크롤. 서버에서 받은 첫 페이지(initialFirstPage)로 하이드레이트해
 * 최초 렌더 후 재요청 깜빡임을 없앤다. (use-live-list.ts 패턴)
 */
export const usePosts = (initialFirstPage?: PostListResponse) => {
  const query = useInfiniteQuery({
    queryKey: ["community-posts"],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: initialFirstPage
      ? { pages: [initialFirstPage], pageParams: [undefined] }
      : undefined,
  });

  // 페이지 경계 중복 방지(드물게 동일 글이 두 페이지에 걸칠 수 있음)
  const seen = new Set<string>();
  const posts: CommunityPostSummary[] = [];
  for (const page of query.data?.pages ?? []) {
    for (const post of page.list) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        posts.push(post);
      }
    }
  }

  return {
    posts,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  };
};
