import Image from "next/image";
import { User } from "lucide-react";
import type { AuthorRef } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";

interface AuthorBadgeProps {
  author: AuthorRef;
  createdAt: string;
  className?: string;
}

/** 작성자 아바타(SOOP 프로필) + 닉 + 상대시간. 글카드·상세·댓글에서 공용. */
export default function AuthorBadge({
  author,
  createdAt,
  className,
}: AuthorBadgeProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-xs",
        className,
      )}
    >
      <span className="ring-border relative inline-flex size-5 shrink-0 overflow-hidden rounded-full ring-1">
        {author.profileImage ? (
          <Image
            src={author.profileImage}
            alt={author.nick}
            fill
            sizes="20px"
            className="object-cover"
          />
        ) : (
          <span className="bg-muted flex size-full items-center justify-center">
            <User className="size-3" />
          </span>
        )}
      </span>
      <span className="text-foreground/80 font-medium">{author.nick}</span>
      <span aria-hidden>·</span>
      <span>{formatRelativeTime(createdAt)}</span>
    </div>
  );
}
