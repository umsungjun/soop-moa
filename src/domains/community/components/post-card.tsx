import { MessageSquare, ThumbsUp } from "lucide-react";
import type { CommunityPostSummary } from "@/lib/supabase/types";
import AuthorBadge from "./author-badge";

interface PostCardProps {
  post: CommunityPostSummary;
}

/** 목록의 글 한 줄 — 카드 전체가 상세로 향하는 링크. */
export default function PostCard({ post }: PostCardProps) {
  return (
    <a
      href={`/community/${post.id}`}
      className="ring-foreground/10 hover:bg-muted/40 focus-visible:ring-ring/50 block rounded-xl bg-card p-4 ring-1 transition-colors outline-none focus-visible:ring-3"
    >
      <h2 className="line-clamp-2 font-medium">{post.title}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <AuthorBadge author={post.author} createdAt={post.createdAt} />
        <span className="text-muted-foreground flex items-center gap-3 text-xs tabular-nums">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="size-3.5" />
            {post.likeCount}
          </span>
        </span>
      </div>
    </a>
  );
}
