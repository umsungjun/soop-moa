"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/domains/auth/hooks/use-session";
import type { ReactionValue } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { useReaction } from "../hooks/use-reaction";

interface ReactionButtonsProps {
  postId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialMyReaction: ReactionValue | null;
}

/** 좋아요/싫어요 토글 — 비로그인 시 클릭하면 로그인 안내 토스트. */
export default function ReactionButtons({
  postId,
  initialLikeCount,
  initialDislikeCount,
  initialMyReaction,
}: ReactionButtonsProps) {
  const { isAuthenticated } = useSession();
  const { likeCount, dislikeCount, myReaction, react, isPending } = useReaction(
    postId,
    {
      likeCount: initialLikeCount,
      dislikeCount: initialDislikeCount,
      myReaction: initialMyReaction,
    },
  );

  const handle = (value: ReactionValue) => {
    if (!isAuthenticated) {
      toast.error("로그인 후 이용할 수 있습니다.");
      return;
    }
    react(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={myReaction === "like" ? "secondary" : "outline"}
        size="sm"
        onClick={() => handle("like")}
        disabled={isPending}
        className={cn(myReaction === "like" && "text-primary")}
        aria-pressed={myReaction === "like"}
      >
        <ThumbsUp className="size-4" />
        <span className="tabular-nums">{likeCount}</span>
      </Button>
      <Button
        variant={myReaction === "dislike" ? "secondary" : "outline"}
        size="sm"
        onClick={() => handle("dislike")}
        disabled={isPending}
        className={cn(myReaction === "dislike" && "text-destructive")}
        aria-pressed={myReaction === "dislike"}
      >
        <ThumbsDown className="size-4" />
        <span className="tabular-nums">{dislikeCount}</span>
      </Button>
    </div>
  );
}
