"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** 본인 글 삭제 → 성공 시 목록으로 이동. */
export const useDeletePost = (postId: string) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "삭제에 실패했습니다.");
      }
      toast.success("글을 삭제했습니다.");
      router.push("/community");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  return { deletePost, isDeleting };
};
