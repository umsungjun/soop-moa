"use client";

import { Radio } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveCard } from "./live-card";
import type { LiveBroadcast } from "@/domains/live/types";

interface LiveGridProps {
  broadcasts: LiveBroadcast[];
  isLoading: boolean;
  onSelect?: (broadcast: LiveBroadcast) => void;
}

export function LiveGrid({ broadcasts, isLoading, onSelect }: LiveGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {broadcasts.map((b) => (
        <LiveCard
          key={`${b.bjId}-${b.broadNo}`}
          broadcast={b}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
