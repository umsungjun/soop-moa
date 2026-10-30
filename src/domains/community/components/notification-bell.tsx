"use client";

import Image from "next/image";
import { Bell, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/domains/auth/hooks/use-session";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { useNotifications } from "../hooks/use-notifications";
import type { CommunityNotification } from "../types";

const MESSAGE: Record<CommunityNotification["type"], string> = {
  comment: "님이 내 글에 댓글을 남겼어요",
  reply: "님이 내 댓글에 답글을 남겼어요",
};

/** 헤더 알림 종. 글·댓글을 쓸 수 있는 사용자(SOOP id 식별됨)에게만 보인다. */
export default function NotificationBell() {
  const { isAuthenticated, user } = useSession();
  const enabled = isAuthenticated && !!user?.userId;
  const { list, unreadCount, error, markRead } = useNotifications(enabled);

  if (!enabled) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
        className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/50 data-popup-open:bg-muted relative flex size-8 items-center justify-center rounded-full sm:size-9 transition-colors outline-none focus-visible:ring-3"
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="bg-destructive ring-background absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white tabular-nums ring-2">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
      >
        {/* GroupLabel(Base UI)은 Group 안에 있어야 한다. */}
        <DropdownMenuGroup className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="text-foreground p-0 text-sm font-semibold">
            알림
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markRead()}
              // 메뉴를 키보드로 열면 첫 버튼에 포커스가 가므로 링 대신 밑줄로 표시한다.
              className="text-primary text-xs font-medium outline-none hover:underline focus-visible:underline"
            >
              모두 읽음
            </button>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="m-0" />

        {error ? (
          <p className="text-muted-foreground px-3 py-8 text-center text-sm">
            알림을 불러오지 못했어요.
          </p>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground px-3 py-8 text-center text-sm">
            내 글에 댓글이나 답글이 달리면 여기에 알려 드려요.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto py-1">
            {list.map((n) => (
              <DropdownMenuItem
                key={n.id}
                render={
                  <a href={`/community/${n.postId}#comment-${n.commentId}`} />
                }
                onClick={() => {
                  if (!n.isRead) markRead([n.id]);
                }}
                className={cn(
                  "cursor-pointer items-start gap-2.5 rounded-none px-3 py-2.5",
                  !n.isRead && "bg-primary/5",
                )}
              >
                <span className="ring-border bg-muted relative mt-0.5 size-8 shrink-0 overflow-hidden rounded-full ring-1">
                  {n.actor.profileImage ? (
                    <Image
                      src={n.actor.profileImage}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-muted-foreground flex size-full items-center justify-center">
                      <User className="size-4" />
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm leading-snug">
                    <span className="font-semibold">{n.actor.nick}</span>
                    {MESSAGE[n.type]}
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-xs">
                    {n.preview}
                  </span>
                  <span className="text-muted-foreground/80 text-[11px]">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </span>
                {!n.isRead ? (
                  <span
                    aria-label="안 읽음"
                    className="bg-primary mt-2 size-2 shrink-0 rounded-full"
                  />
                ) : null}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
