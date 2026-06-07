"use client";

import { useRef } from "react";
import { GripHorizontal, GripVertical } from "lucide-react";
import { MIN_PANEL_SIZE } from "@/domains/multiview/constants";
import type { LayoutSizes, Panel as PanelData } from "@/domains/multiview/types";
import { cn } from "@/lib/utils";

interface GridLayoutProps {
  panels: PanelData[];
  sizes: LayoutSizes;
  renderSlot: (panel: PanelData) => React.ReactNode;
  onSizesChange: (patch: Partial<LayoutSizes>) => void;
  onResizingChange?: (resizing: boolean) => void;
}

const MIN = MIN_PANEL_SIZE / 100; // 분율 하한(각 칸 최소 15%)

function clampFrac(v: number) {
  return Math.min(1 - MIN, Math.max(MIN, v));
}

/**
 * 멀티뷰 그리드 — 패널을 panel.id로 키잉한 평탄한 목록으로 렌더하고 위치는 CSS 그리드로만 정한다.
 * 패널을 닫아도 살아남은 셀의 DOM(iframe)이 유지되어 재생성(새로고침)되지 않는다.
 * 분할선은 절대 위치 핸들로, 드래그하면 컬럼/행 분율(fr)만 바꾼다.
 */
export function GridLayout({
  panels,
  sizes,
  renderSlot,
  onSizesChange,
  onResizingChange,
}: GridLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const n = panels.length;
  const cols = sizes.cols ?? [0.5, 0.5];
  const rows = sizes.rows ?? [0.5, 0.5];

  const gridTemplateColumns = n <= 1 ? "1fr" : `${cols[0]}fr ${cols[1]}fr`;
  const gridTemplateRows = n <= 2 ? "1fr" : `${rows[0]}fr ${rows[1]}fr`;

  // 패널 인덱스 → CSS 그리드 셀 위치. 외형은 기존 1/2/3/4분할 레이아웃과 동일.
  function cellStyle(i: number): React.CSSProperties {
    if (n <= 1) return { gridColumn: "1 / -1", gridRow: "1 / -1" };
    if (n === 2) return { gridColumn: String(i + 1), gridRow: "1" };
    if (n === 3) {
      if (i === 0) return { gridColumn: "1", gridRow: "1" }; // 좌상(1)
      if (i === 1) return { gridColumn: "2", gridRow: "1" }; // 우상(2)
      return { gridColumn: "1 / 3", gridRow: "2" }; // 하단 전체 폭(3)
    }
    // n === 4 → 0=TL 1=TR 2=BL 3=BR (1,2 / 3,4)
    return {
      gridColumn: i % 2 === 0 ? "1" : "2",
      gridRow: i < 2 ? "1" : "2",
    };
  }

  function startDrag(axis: "x" | "y", e: React.PointerEvent) {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    onResizingChange?.(true);

    const onMove = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (axis === "x") {
        const frac = clampFrac((ev.clientX - rect.left) / rect.width);
        onSizesChange({ cols: [frac, 1 - frac] });
      } else {
        const frac = clampFrac((ev.clientY - rect.top) / rect.height);
        onSizesChange({ rows: [frac, 1 - frac] });
      }
    };
    const onUp = () => {
      onResizingChange?.(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const colLeftPct = (cols[0] / (cols[0] + cols[1])) * 100;
  const rowTopPct = (rows[0] / (rows[0] + rows[1])) * 100;

  return (
    <div
      ref={containerRef}
      className="relative grid size-full gap-2"
      style={{ gridTemplateColumns, gridTemplateRows }}
    >
      {panels.map((p, i) => (
        <div key={p.id} className="min-h-0 min-w-0" style={cellStyle(i)}>
          {renderSlot(p)}
        </div>
      ))}

      {/* 세로 분할선(좌/우 컬럼 사이) — 2·3·4분할. 3분할은 상단 행(1·2)에만 적용. */}
      {n >= 2 ? (
        <Gutter
          axis="x"
          style={{
            left: `${colLeftPct}%`,
            top: 0,
            bottom: n === 3 ? `${100 - rowTopPct}%` : 0,
          }}
          onPointerDown={(e) => startDrag("x", e)}
        />
      ) : null}

      {/* 가로 분할선 — 3·4분할 모두 전체 폭(상단 행 / 하단 행 사이) */}
      {n >= 3 ? (
        <Gutter
          axis="y"
          style={{ top: `${rowTopPct}%`, left: 0, right: 0 }}
          onPointerDown={(e) => startDrag("y", e)}
        />
      ) : null}
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
