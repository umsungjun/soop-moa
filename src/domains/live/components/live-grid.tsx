"use client";

import { Radio } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveBroadcast } from "@/domains/live/types";
import { LiveCard } from "./live-card";

interface LiveGridProps {
  broadcasts: LiveBroadcast[];
  isLoading: boolean;
  /** 다음 페이지를 불러오는 중이면 하단에 스켈레톤 행을 덧붙인다. */
  isFetchingNextPage?: boolean;
  /** 사이드바·다이얼로그 등 좁은 곳에선 모바일에서도 2열로 촘촘하게 채운다. */
  dense?: boolean;
  onSelect?: (broadcast: LiveBroadcast) => void;
}

// 뷰포트가 아니라 "컨테이너" 폭에 반응한다.
// 일반 페이지: 모바일 1열 → 넓어질수록 2·3·4열 (모바일 한 줄에 하나).
const GRID_PAGE =
  "grid gap-4 grid-cols-1 @[480px]:grid-cols-2 @[768px]:grid-cols-3 @[1080px]:grid-cols-4";
// 좁은 사이드바/다이얼로그: 기본 2열로 시작해 공간을 채운다.
const GRID_DENSE =
  "grid gap-3 grid-cols-2 @[640px]:grid-cols-3 @[900px]:grid-cols-4";

function SkeletonCell() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function LiveGrid({
  broadcasts,
  isLoading,
  isFetchingNextPage,
  dense,
  onSelect,
}: LiveGridProps) {
  const grid = dense ? GRID_DENSE : GRID_PAGE;

  if (isLoading) {
    return (
      <div className="@container">
        <div className={grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCell key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Radio className="size-10 opacity-50" />
        <p className="text-sm">표시할 라이브 방송이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="@container">
      <div className={grid}>
        {broadcasts.map((b) => (
          <LiveCard
            key={`${b.bjId}-${b.broadNo}`}
            broadcast={b}
            onSelect={onSelect}
          />
        ))}
        {isFetchingNextPage
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCell key={`more-${i}`} />
            ))
          : null}
      </div>
    </div>
  );
}
