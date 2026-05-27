"use client";

import { Separator } from "react-resizable-panels";
import { GripHorizontal, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResizableSplitterProps {
  /** Matches the parent Group orientation. */
  orientation: "horizontal" | "vertical";
}

export function ResizableSplitter({ orientation }: ResizableSplitterProps) {
  const isVertical = orientation === "vertical"; // stacked rows → horizontal bar

  return (
    <Separator
      className={cn(
        "group/sep relative z-20 flex shrink-0 items-center justify-center bg-transparent outline-none",
        isVertical ? "h-2.5 w-full" : "w-2.5 self-stretch",
      )}
    >
      <span
        className={cn(
          "bg-border transition-colors duration-150 group-hover/sep:bg-primary group-active/sep:bg-primary",
          isVertical ? "h-px w-full" : "h-full w-px",
        )}
      />
      <span className="bg-card ring-border text-muted-foreground group-hover/sep:bg-primary group-hover/sep:text-primary-foreground group-hover/sep:ring-primary absolute flex items-center justify-center rounded-full p-0.5 opacity-0 ring-1 transition-all duration-150 group-hover/sep:opacity-100">
        {isVertical ? (
          <GripHorizontal className="size-3" />
        ) : (
          <GripVertical className="size-3" />
        )}
      </span>
    </Separator>
  );
}
