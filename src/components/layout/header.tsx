"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutGrid, MessagesSquare, Radio } from "lucide-react";
import { UserMenu } from "@/domains/auth/components/user-menu";
import NotificationBell from "@/domains/community/components/notification-bell";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/live", label: "라이브", icon: Radio },
  { href: "/multiview", label: "멀티뷰", icon: LayoutGrid },
  { href: "/community", label: "커뮤니티", icon: MessagesSquare },
  { href: "/guide", label: "가이드", icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-background/70 border-border/60 sticky top-0 z-40 border-b backdrop-blur-xl">
      {/* 320px 폭에서 로그인 버튼이 24px 넘쳐 가로 스크롤이 생겨 모바일 간격을 줄인다. */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  // 모바일은 아이콘만 보이므로 좌우 여백을 줄여 로그인 상태(테마·알림·아바타)에서도 360px 폭에 들어가게 한다.
                  "flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          {/* 360px 미만은 알림 종까지 넣으면 넘쳐 테마 토글을 숨긴다. 테마는 시스템 설정(기본 다크)을 따른다. */}
          <ThemeToggle className="max-[359px]:hidden" />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
