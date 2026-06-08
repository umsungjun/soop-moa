"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PostResponse } from "../types";

/** 글 작성 → 성공 시 상세로 이동. 제출 중 상태를 함께 반환한다. */
export const useCreatePost = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = async (input: { title: string; body: string }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "글 작성에 실패했습니다.");
      }
      const { post } = (await res.json()) as PostResponse;
      toast.success("글을 등록했습니다.");
      router.push(`/community/${post.id}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "글 작성에 실패했습니다.",
      );
      setIsSubmitting(false); // 성공 시엔 페이지 이동하므로 해제하지 않는다
    }
  };

  return { createPost, isSubmitting };
};
