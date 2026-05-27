"use client";

import { Plus, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_PANELS } from "@/domains/multiview/constants";
import type { Panel as PanelData } from "@/domains/multiview/types";

interface MobileStackProps {
  panels: PanelData[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onAddPanel: () => void;
  renderSlot: (panel: PanelData) => React.ReactNode;
}

export function MobileStack({
  panels,
  activeId,
  onActivate,
  onAddPanel,
  renderSlot,
}: MobileStackProps) {
  const active =
    panels.find((p) => p.id === activeId) ?? panels[0] ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 p-2">
        {active ? renderSlot(active) : null}
      </div>

      <div className="border-border/60 bg-background flex gap-2 overflow-x-auto border-t p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {panels.map((p, i) => {
          const isActive = p.id === active?.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onActivate(p.id)}
              className={cn(
                "ring-border flex h-12 min-w-28 shrink-0 items-center gap-2 rounded-lg px-2.5 ring-1 transition-colors",
                isActive
                  ? "ring-primary bg-primary/10"
                  : "bg-card hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="flex min-w-0 flex-col items-start">
                {p.bjId ? (
                  <span className="truncate font-mono text-xs font-medium">
                    {p.bjId}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">빈 슬롯</span>
                )}
                {p.bjId ? (
                  <span className="text-destructive flex items-center gap-1 text-[10px]">
                    <Radio className="size-2.5" />
                    LIVE
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}

        {panels.length < MAX_PANELS ? (
          <button
            type="button"
            onClick={onAddPanel}
            aria-label="패널 추가"
            className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-colors"
          >
            <Plus className="size-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
