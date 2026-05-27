"use client";

import Image from "next/image";
import { Plus, Radio, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LiveBroadcast } from "@/domains/live/types";
import { formatViewerCount } from "@/utils/format";
import { cn } from "@/lib/utils";

interface LiveCardProps {
  broadcast: LiveBroadcast;
  /** When provided, the card acts as a button (e.g. add to a multiview panel). */
  onSelect?: (broadcast: LiveBroadcast) => void;
  /** Link target when not in select mode. Defaults to a fresh multiview. */
  href?: string;
}

export function LiveCard({ broadcast, onSelect, href }: LiveCardProps) {
  const link = href ?? `/multiview?v=${encodeURIComponent(broadcast.bjId)}`;

  const inner = (
    <>
      <div className="bg-muted relative aspect-video w-full overflow-hidden">
        {broadcast.thumbnail ? (
          <Image
            src={broadcast.thumbnail}
            alt={broadcast.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <Radio className="size-8" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Badge className="bg-destructive gap-1 border-0 text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </Badge>
        </div>

        <div className="absolute right-2 bottom-2">
          <Badge
            variant="secondary"
            className="tabular-nums gap-1 bg-black/70 text-white backdrop-blur-sm"
          >
            <Users className="size-3" />
            {formatViewerCount(broadcast.viewerCount)}
          </Badge>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold">
            <Plus className="size-4" />
            멀티뷰에 추가
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-balance">
          {broadcast.title}
        </h3>
        <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
          <span className="truncate">{broadcast.bjNick}</span>
          {broadcast.categoryName ? (
            <span className="bg-muted shrink-0 rounded px-1.5 py-0.5">
              {broadcast.categoryName}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  const className = cn(
    "group bg-card ring-border focus-visible:ring-ring/60 flex flex-col overflow-hidden rounded-xl text-left ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/50 focus-visible:ring-2 focus-visible:outline-none",
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onSelect(broadcast)}
      >
        {inner}
      </button>
    );
  }

  return (
    <a href={link} className={className}>
      {inner}
    </a>
  );
}
