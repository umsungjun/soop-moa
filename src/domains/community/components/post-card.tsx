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
      className="group/card ring-foreground/10 hover:ring-primary/30 focus-visible:ring-ring/50 block rounded-2xl bg-card p-5 shadow-sm ring-1 transition-all outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3"
    >
      <h2 className="group-hover/card:text-primary line-clamp-2 text-[0.95rem] font-semibold tracking-tight transition-colors">
        {post.title}
      </h2>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <AuthorBadge author={post.author} createdAt={post.createdAt} />
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums">
          <span className="bg-muted/60 flex items-center gap-1 rounded-full px-2 py-0.5">
            <MessageSquare className="size-3.5" />
            {post.commentCount}
          </span>
          <span className="bg-muted/60 flex items-center gap-1 rounded-full px-2 py-0.5">
            <ThumbsUp className="size-3.5" />
            {post.likeCount}
          </span>
        </span>
      </div>
    </a>
  );
}
