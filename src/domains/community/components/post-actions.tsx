"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/domains/auth/hooks/use-session";
import { useDeletePost } from "../hooks/use-delete-post";

interface PostActionsProps {
  postId: string;
  authorId: string;
}

/** 본인 글에만 노출되는 삭제 버튼(인라인 확인). */
export default function PostActions({ postId, authorId }: PostActionsProps) {
  const { user } = useSession();
  const { deletePost, isDeleting } = useDeletePost(postId);
  const [confirming, setConfirming] = useState(false);

  if (!user || user.userId !== authorId) return null;

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">삭제할까요?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={deletePost}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중…" : "삭제"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
        >
          취소
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-4" />
      삭제
    </Button>
  );
}
