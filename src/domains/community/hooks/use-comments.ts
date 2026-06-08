"use client";

import { toast } from "sonner";
import useSWR from "swr";
import type { CommentListResponse } from "../types";

const fetcher = (url: string): Promise<CommentListResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("댓글을 불러오지 못했습니다.");
    return res.json();
  });

/**
 * 댓글 목록(1단계 트리) + 작성/삭제 액션. 변경 후 mutate로 트리를 재검증한다.
 */
export const useComments = (postId: string) => {
  const key = `/api/community/posts/${postId}/comments`;
  const { data, error, isLoading, mutate } = useSWR<CommentListResponse>(
    key,
    fetcher,
  );

  const createComment = async (input: {
    body: string;
    parentId?: string | null;
  }): Promise<boolean> => {
    try {
      const res = await fetch(key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "댓글 작성에 실패했습니다.");
      }
      await mutate();
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "댓글 작성에 실패했습니다.",
      );
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      const res = await fetch(`${key}/${commentId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "댓글 삭제에 실패했습니다.");
      }
      toast.success("댓글을 삭제했습니다.");
      await mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.",
      );
    }
  };

  return {
    comments: data?.list ?? [],
    isLoading,
    error,
    createComment,
    deleteComment,
  };
};
