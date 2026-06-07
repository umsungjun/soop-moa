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
  onSelect?: (broadcast: LiveBroadcast) => void;
}

// 뷰포트가 아니라 "컨테이너" 폭에 반응하도록 컨테이너 쿼리를 사용한다.
// 사이드바(≈280px)도 2열로 채우고, 다이얼로그 3열, 넓은 /live 페이지에선 4열.
const GRID =
  "grid gap-3 grid-cols-2 @[560px]:grid-cols-3 @[820px]:grid-cols-4";

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
  onSelect,
}: LiveGridProps) {
  if (isLoading) {
    return (
      <div className="@container">
        <div className={GRID}>
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
      <div className={GRID}>
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
