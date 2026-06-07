"use client";

import { useState } from "react";
import { Clock, Flame } from "lucide-react";
import { useLiveList } from "@/domains/live/hooks/use-live-list";
import type { LiveBroadcast, SortType } from "@/domains/live/types";
import { cn } from "@/lib/utils";
import { CategoryFilter } from "./category-filter";
import { LiveGrid } from "./live-grid";

interface LiveBrowserProps {
  /** When provided, cards act as selectors (used inside multiview dialog). */
  onSelect?: (broadcast: LiveBroadcast) => void;
}

export function LiveBrowser({ onSelect }: LiveBrowserProps) {
  const [category, setCategory] = useState<string | undefined>();
  const [order, setOrder] = useState<SortType>("view_cnt");
  const { broadcasts, isLoading } = useLiveList({ category, order });

  const sortBtn = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-secondary text-secondary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="flex flex-col gap-4">
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

      <LiveGrid
        broadcasts={broadcasts}
        isLoading={isLoading}
        onSelect={onSelect}
      />
    </div>
  );
}
