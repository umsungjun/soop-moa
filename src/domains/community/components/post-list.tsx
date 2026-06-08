"use client";

import { useEffect, useRef } from "react";
import { usePosts } from "../hooks/use-posts";
import type { PostListResponse } from "../types";
import EmptyState from "./empty-state";
import PostCard from "./post-card";
import PostListSkeleton from "./post-list-skeleton";

interface PostListProps {
  initialFirstPage?: PostListResponse;
}

/** 글 목록 + 무한스크롤(IntersectionObserver). 서버 첫 페이지로 하이드레이트. */
export default function PostList({ initialFirstPage }: PostListProps) {
  const { posts, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePosts(initialFirstPage);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <PostListSkeleton />;
  if (posts.length === 0) return <EmptyState />;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} aria-hidden className="h-px" />
      {isFetchingNextPage ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          불러오는 중…
        </p>
      ) : null}
    </>
  );
}
