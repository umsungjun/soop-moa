"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/domains/auth/components/login-button";
import { useSession } from "@/domains/auth/hooks/use-session";
import type { CommunityComment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import AuthorBadge from "./author-badge";
import CommentForm from "./comment-form";

interface CommentItemProps {
  comment: CommunityComment;
  createComment: (input: {
    body: string;
    parentId?: string | null;
  }) => Promise<boolean>;
  deleteComment: (commentId: string) => void;
  isReply?: boolean;
}

/** 댓글 한 건 + (최상위일 때) 1단계 대댓글. 본인 댓글이면 삭제, 로그인 시 답글. id는 알림 링크(#comment-{id})의 이동 대상이다. */
export default function CommentItem({
  comment,
  createComment,
  deleteComment,
  isReply = false,
}: CommentItemProps) {
  const { user, isAuthenticated, isLoading } = useSession();
  const [showReply, setShowReply] = useState(false);
  const isOwn = !!user?.userId && user.userId === comment.author.userId;
  const canReply = isAuthenticated && !!user?.userId;
  // 비로그인에도 답글 버튼을 보여 기능을 알리고, 누르면 로그인을 안내한다. 로그인했지만 SOOP id를 못 구한 계정은 상단 안내로 대신한다.
  const showReplyButton =
    !isReply && !isLoading && (canReply || !isAuthenticated);

  const handleReply = async (body: string): Promise<boolean> => {
    const ok = await createComment({ body, parentId: comment.id });
    if (ok) setShowReply(false);
    return ok;
  };

  return (
    <div className={cn(isReply && "border-border/70 ml-2 border-l-2 pl-4")}>
      <div
        id={`comment-${comment.id}`}
        className="-mx-2 scroll-mt-24 rounded-lg px-2 py-3 transition-colors duration-700"
      >
        {comment.isDeleted ? (
          <p className="text-muted-foreground text-sm italic">
            삭제된 댓글입니다.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <AuthorBadge
                author={comment.author}
                createdAt={comment.createdAt}
              />
              {isOwn ? (
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-muted-foreground"
                  onClick={() => deleteComment(comment.id)}
                >
                  삭제
                </Button>
              ) : null}
            </div>
            <p className="mt-1.5 text-sm break-words whitespace-pre-wrap">
              {comment.body}
            </p>
            {showReplyButton ? (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground mt-1"
                onClick={() => setShowReply((v) => !v)}
              >
                답글
              </Button>
            ) : null}
          </>
        )}

        {showReply ? (
          <div className="mt-2">
            {canReply ? (
              <CommentForm
                onSubmit={handleReply}
                submitLabel="답글 등록"
                placeholder="답글을 입력하세요"
                autoFocus
                onCancel={() => setShowReply(false)}
              />
            ) : (
              <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
                <p className="text-muted-foreground text-sm">
                  로그인하면 답글을 남길 수 있어요.
                </p>
                <LoginButton size="sm" />
              </div>
            )}
          </div>
        ) : null}
      </div>

      {!isReply && comment.replies.length > 0 ? (
        <div className="flex flex-col">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              createComment={createComment}
              deleteComment={deleteComment}
              isReply
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
