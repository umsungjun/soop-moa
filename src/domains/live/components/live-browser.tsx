"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Flame, Loader2Icon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLiveList } from "@/domains/live/hooks/use-live-list";
import type { LiveBroadcast, SortType } from "@/domains/live/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { CategoryFilter } from "./category-filter";
import { LiveGrid } from "./live-grid";

// 검색 모드 자동 로드 한도. SOOP 목록 API에 텍스트 검색이 없어 받아온 페이지 안에서만 필터링하므로, 결과가 부족하면 다음 페이지를 이어서 받되 검색어 하나당 이 페이지 수까지만 자동으로 받는다. 그 뒤는 사용자가 버튼으로 이어서 불러온다.
const SEARCH_AUTO_LOAD_PAGES = 3;
// 일치 결과가 이 수 이상 모이면 자동 로드를 멈춘다.
const SEARCH_ENOUGH_MATCHES = 8;

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
  const {
    broadcasts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useLiveList({ category, order });

  // SOOP 목록 API는 텍스트 검색을 지원하지 않으므로, 이미 불러온 방송을 BJ 닉네임·제목·아이디 기준으로 클라이언트 측에서 필터링한다.
  // 필터링은 입력 즉시 반영하고(가벼움), 추가 페이지 로드 판단은 300ms 디바운스한다(키 입력마다 API를 부르지 않도록).
  const q = search.trim().toLowerCase();
  const debouncedQ = useDebouncedValue(q, 300);
  const searching = q.length > 0;

  const filtered = useMemo(
    () =>
      q
        ? broadcasts.filter((b) =>
            [b.bjNick, b.title, b.bjId].some((s) =>
              s?.toLowerCase().includes(q),
            ),
          )
        : broadcasts,
    [broadcasts, q],
  );

  // 검색 모드 자동 로드 — 결과가 부족하면 다음 페이지를 이어서 받되, 검색어당 한도를 두어 API 연쇄 호출을 막는다.
  // fetchNextPage는 cancelRefetch: false로 호출한다. 기본값(true)은 진행 중 재호출 시 이전 요청을 버리고 같은 페이지를 다시 요청해 중복 호출이 생긴다.
  const autoLoadedRef = useRef(0);
  useEffect(() => {
    autoLoadedRef.current = 0;
  }, [debouncedQ]);
  useEffect(() => {
    if (!debouncedQ || !hasNextPage || isFetchingNextPage) return;
    if (filtered.length >= SEARCH_ENOUGH_MATCHES) return;
    if (autoLoadedRef.current >= SEARCH_AUTO_LOAD_PAGES) return;
    autoLoadedRef.current += 1;
    fetchNextPage({ cancelRefetch: false });
  }, [
    debouncedQ,
    filtered.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // 무한 스크롤 — 센티넬이 뷰포트 근처(600px)에 들어오면 다음 페이지를 미리 로드.
  // 검색 중에는 끈다. 필터로 목록이 짧아지면 센티넬이 항상 보여 목록 끝까지 페이지를 연쇄 호출하게 되기 때문이다.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || searching) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage)
          fetchNextPage({ cancelRefetch: false });
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searching]);

  // "더 많은 방송에서 검색" — 자동 로드 카운터를 되돌려 한 묶음(최대 SEARCH_AUTO_LOAD_PAGES)을 더 이어서 받는다.
  function loadMoreForSearch() {
    autoLoadedRef.current = 0;
    fetchNextPage({ cancelRefetch: false });
  }

  const emptyMessage = searching
    ? isFetchingNextPage
      ? "더 많은 방송에서 찾는 중…"
      : `‘${search.trim()}’에 해당하는 방송이 없습니다.`
    : undefined;

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

      {/* 검색 중에는 다음 페이지 스켈레톤 카드를 붙이지 않고 아래 상태 줄로 대신한다. */}
      <LiveGrid
        broadcasts={filtered}
        isLoading={isLoading}
        isFetchingNextPage={!searching && isFetchingNextPage}
        emptyMessage={emptyMessage}
        dense={dense}
        onSelect={onSelect}
      />

      {/* 검색 모드 상태 줄 — 진행 상황을 한 줄로 보여주고, 자동 로드 한도 이후에는 버튼으로 이어서 불러온다. 빈 상태가 이미 "찾는 중"을 표시할 때는 중복이라 숨긴다. */}
      {searching &&
      !isLoading &&
      !(filtered.length === 0 && isFetchingNextPage) ? (
        <div className="text-muted-foreground flex items-center justify-center gap-1.5 py-3 text-xs">
          {isFetchingNextPage ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              <span>더 많은 방송에서 찾는 중…</span>
            </>
          ) : hasNextPage ? (
            <button
              type="button"
              onClick={loadMoreForSearch}
              className="hover:text-foreground underline underline-offset-4"
            >
              불러온 {broadcasts.length}개 중 {filtered.length}개 일치 · 더 많은
              방송에서 검색
            </button>
          ) : (
            <span>
              전체 {broadcasts.length}개 중 {filtered.length}개 일치
            </span>
          )}
        </div>
      ) : null}

      {/* 무한 스크롤 트리거 — 마지막 카드 아래에 위치 */}
      <div ref={sentinelRef} aria-hidden className="h-1" />
    </div>
  );
}
