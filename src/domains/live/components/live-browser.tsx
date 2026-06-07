"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Flame, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLiveList } from "@/domains/live/hooks/use-live-list";
import type { LiveBroadcast, SortType } from "@/domains/live/types";
import { cn } from "@/lib/utils";
import { CategoryFilter } from "./category-filter";
import { LiveGrid } from "./live-grid";

interface LiveBrowserProps {
  /** When provided, cards act as selectors (used inside multiview dialog). */
  onSelect?: (broadcast: LiveBroadcast) => void;
  /** 스크롤 컨테이너(사이드바·다이얼로그) 안에서 검색·필터를 상단에 고정한다. */
  stickyHeader?: boolean;
  /** 좁은 곳(사이드바·다이얼로그)에선 모바일에서도 2열로 촘촘하게 표시. */
  dense?: boolean;
}

export function LiveBrowser({
  onSelect,
  stickyHeader,
  dense,
}: LiveBrowserProps) {
  const [category, setCategory] = useState<string | undefined>();
  const [order, setOrder] = useState<SortType>("view_cnt");
  const [search, setSearch] = useState("");
  const { broadcasts, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useLiveList({ category, order });

  // SOOP 목록 API는 텍스트 검색을 지원하지 않으므로, 이미 불러온 방송을
  // BJ 닉네임·제목·아이디 기준으로 클라이언트 측에서 필터링한다.
  const q = search.trim().toLowerCase();
  const filtered = q
    ? broadcasts.filter((b) =>
        [b.bjNick, b.title, b.bjId].some((s) => s?.toLowerCase().includes(q)),
      )
    : broadcasts;

  // 무한 스크롤 — 센티넬이 뷰포트 근처(600px)에 들어오면 다음 페이지를 미리 로드.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sortBtn = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-secondary text-secondary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex flex-col gap-3 pb-3",
          // sticky일 때 상단 여백은 헤더 안쪽(pt-3)에 둬서 배경이 덮게 한다.
          // 스크롤 시 헤더 위에 빈 공간이 보이지 않도록.
          stickyHeader && "bg-background sticky top-0 z-20 pt-3",
        )}
      >
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="BJ 닉네임·제목·아이디로 검색"
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter value={category} onChange={setCategory} />
          <div className="bg-card ring-border flex shrink-0 gap-1 rounded-xl p-1 ring-1">
            <button
              type="button"
              className={sortBtn(order === "view_cnt")}
              onClick={() => setOrder("view_cnt")}
            >
              <Flame className="size-3.5" />
              인기순
            </button>
            <button
              type="button"
              className={sortBtn(order === "broad_start")}
              onClick={() => setOrder("broad_start")}
            >
              <Clock className="size-3.5" />
              최신순
            </button>
          </div>
        </div>
      </div>

      <LiveGrid
        broadcasts={filtered}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        dense={dense}
        onSelect={onSelect}
      />
      {/* 무한 스크롤 트리거 — 마지막 카드 아래에 위치 */}
      <div ref={sentinelRef} aria-hidden className="h-1" />
    </div>
  );
}
