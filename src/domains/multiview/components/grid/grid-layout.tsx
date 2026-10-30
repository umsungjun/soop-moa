"use client";

import { useRef } from "react";
import { GripHorizontal, GripVertical } from "lucide-react";
import type {
  LayoutId,
  LayoutSizes,
  Panel as PanelData,
} from "@/domains/multiview/types";
import {
  moveBoundary,
  resolveLayout,
  resolveSizes,
  stableOrder,
  type Gutter as GutterData,
} from "@/domains/multiview/utils/layouts";
import { cn } from "@/lib/utils";

interface GridLayoutProps {
  panels: PanelData[];
  layout: LayoutId;
  sizes: LayoutSizes;
  renderSlot: (panel: PanelData) => React.ReactNode;
  onSizesChange: (patch: Partial<LayoutSizes>) => void;
  onResizingChange?: (resizing: boolean) => void;
}

const GAP = 8; // px, 컨테이너의 gap-2와 같아야 분할선이 틈 한가운데 놓인다

const prefix = (tracks: number[], i: number) =>
  tracks.slice(0, i).reduce((a, b) => a + b, 0);

// 트랙 i가 시작하는 지점. fr은 gap을 뺀 나머지 폭을 나누므로 gap을 따로 더한다.
const trackStart = (tracks: number[], i: number) =>
  `calc((100% - ${(tracks.length - 1) * GAP}px) * ${prefix(tracks, i)} + ${i * GAP}px)`;

const trackSpan = (tracks: number[], from: number, to: number) =>
  `calc((100% - ${(tracks.length - 1) * GAP}px) * ${prefix(tracks, to) - prefix(tracks, from)} + ${(to - from - 1) * GAP}px)`;

// 경계 b의 gap 한가운데.
const boundaryCenter = (tracks: number[], b: number) =>
  `calc((100% - ${(tracks.length - 1) * GAP}px) * ${prefix(tracks, b)} + ${(b - 0.5) * GAP}px)`;

/**
 * 멀티뷰 그리드. 배치 프리셋(utils/layouts.ts)의 셀 좌표대로 CSS 그리드에 놓는다.
 * 패널은 stableOrder로 DOM 순서를 고정하고 위치만 바꿔서, 닫기·메인으로 올리기에도 살아남은 iframe이 다시 로드되지 않는다.
 */
export function GridLayout({
  panels,
  layout,
  sizes,
  renderSlot,
  onSizesChange,
  onResizingChange,
}: GridLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preset = resolveLayout(layout, panels.length);
  const { cols, rows } = resolveSizes(sizes, preset);

  function startDrag(g: GutterData, e: React.PointerEvent) {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    onResizingChange?.(true);
    const isX = g.axis === "x";
    // 드래그 중에는 이 경계의 양옆 트랙만 바뀌므로 시작 시점 분율을 기준으로 계산해도 된다.
    const tracks = isX ? cols : rows;

    const onMove = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const free = (isX ? rect.width : rect.height) - (tracks.length - 1) * GAP;
      const pos =
        (isX ? ev.clientX - rect.left : ev.clientY - rect.top) -
        (g.boundary - 0.5) * GAP;
      const next = moveBoundary(tracks, g.boundary, pos / free);
      onSizesChange(isX ? { cols: next } : { rows: next });
    };
    const onUp = () => {
      onResizingChange?.(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={containerRef}
      className="relative grid size-full gap-2"
      style={{
        gridTemplateColumns: cols.map((f) => `${f}fr`).join(" "),
        gridTemplateRows: rows.map((f) => `${f}fr`).join(" "),
      }}
    >
      {stableOrder(panels).map(({ panel, index }) => {
        const c = preset.cells[index];
        return (
          <div
            key={panel.id}
            className="min-h-0 min-w-0"
            style={{
              gridColumn: `${c.col + 1} / span ${c.colSpan}`,
              gridRow: `${c.row + 1} / span ${c.rowSpan}`,
            }}
          >
            {renderSlot(panel)}
          </div>
        );
      })}

      {preset.gutters.map((g) => (
        <Gutter
          key={`${g.axis}${g.boundary}-${g.from}`}
          axis={g.axis}
          style={
            g.axis === "x"
              ? {
                  left: boundaryCenter(cols, g.boundary),
                  top: trackStart(rows, g.from),
                  height: trackSpan(rows, g.from, g.to),
                }
              : {
                  top: boundaryCenter(rows, g.boundary),
                  left: trackStart(cols, g.from),
                  width: trackSpan(cols, g.from, g.to),
                }
          }
          onPointerDown={(e) => startDrag(g, e)}
        />
      ))}
    </div>
  );
}

function Gutter({
  axis,
  style,
  onPointerDown,
}: {
  axis: "x" | "y";
  style: React.CSSProperties;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const isX = axis === "x";
  return (
    <div
      onPointerDown={onPointerDown}
      style={style}
      className={cn(
        "group/sep absolute z-20 flex touch-none items-center justify-center",
        isX
          ? "w-3 -translate-x-1/2 cursor-col-resize"
          : "h-3 -translate-y-1/2 cursor-row-resize",
      )}
    >
      <span
        className={cn(
          "bg-transparent transition-colors duration-150 group-hover/sep:bg-primary group-active/sep:bg-primary",
          isX ? "h-full w-px" : "h-px w-full",
        )}
      />
      <span className="bg-card ring-border text-muted-foreground group-hover/sep:bg-primary group-hover/sep:text-primary-foreground group-hover/sep:ring-primary absolute flex items-center justify-center rounded-full p-0.5 opacity-0 ring-1 transition-all duration-150 group-hover/sep:opacity-100">
        {isX ? (
          <GripVertical className="size-3" />
        ) : (
          <GripHorizontal className="size-3" />
        )}
      </span>
    </div>
  );
}
