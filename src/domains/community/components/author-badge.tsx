import Image from "next/image";
import { BadgeCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AuthorRef } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { isOperator } from "../utils/operator";

interface AuthorBadgeProps {
  author: AuthorRef;
  createdAt: string;
  className?: string;
}

/** 작성자 아바타(SOOP 프로필) + 닉 + 운영자 뱃지 + 상대시간. 글카드·상세·댓글에서 공용. */
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
      {isOperator(author.userId) ? (
        <Badge className="h-4 gap-0.5 px-1.5 text-[10px] has-data-[icon=inline-start]:pl-1">
          <BadgeCheck data-icon="inline-start" />
          운영자
        </Badge>
      ) : null}
      <span aria-hidden>·</span>
      <span>{formatRelativeTime(createdAt)}</span>
    </div>
  );
}
