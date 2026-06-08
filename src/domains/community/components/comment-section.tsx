"use client";

import { LoginButton } from "@/domains/auth/components/login-button";
import { useSession } from "@/domains/auth/hooks/use-session";
import { useComments } from "../hooks/use-comments";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";

interface CommentSectionProps {
  postId: string;
}

/** 글 상세 하단의 댓글 영역 — 입력 폼 + 1단계 트리 목록. */
export default function CommentSection({ postId }: CommentSectionProps) {
  const { isAuthenticated, user } = useSession();
  const { comments, isLoading, createComment, deleteComment } =
    useComments(postId);

  // 화면상 댓글 수(대댓글 포함). tombstone도 포함되므로 글의 commentCount와 미세하게 다를 수 있다.
  const totalCount = comments.reduce((n, c) => n + 1 + c.replies.length, 0);
  // SOOP user_id 보강 실패(기본 이미지 등) 시 작성 불가 — 폼 대신 안내.
  const canWrite = isAuthenticated && !!user?.userId;

  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        댓글
        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
          {totalCount}
        </span>
      </h2>

      {canWrite ? (
        <CommentForm onSubmit={(body) => createComment({ body })} />
      ) : isAuthenticated ? (
        <div className="ring-foreground/10 bg-card rounded-2xl p-4 text-sm shadow-sm ring-1">
          <p className="text-muted-foreground">
            SOOP 계정을 식별할 수 없어 댓글을 남길 수 없습니다. SOOP 프로필
            이미지를 설정한 뒤 다시 로그인해 주세요.
          </p>
        </div>
      ) : (
        <div className="ring-foreground/10 bg-card flex items-center justify-between gap-3 rounded-2xl p-4 shadow-sm ring-1">
          <p className="text-muted-foreground text-sm">
            로그인 후 댓글을 남길 수 있습니다.
          </p>
          <LoginButton size="sm" />
        </div>
      )}

      <div className="divide-border mt-4 divide-y">
        {isLoading ? (
          <p className="text-muted-foreground py-4 text-sm">
            댓글을 불러오는 중…
          </p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              createComment={createComment}
              deleteComment={deleteComment}
            />
          ))
        )}
      </div>
    </section>
  );
}
