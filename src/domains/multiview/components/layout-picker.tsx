"use client";

import type { LayoutId } from "@/domains/multiview/types";
import {
  getPresets,
  resolveLayout,
  type LayoutPreset,
} from "@/domains/multiview/utils/layouts";
import { cn } from "@/lib/utils";

interface LayoutPickerProps {
  count: number;
  value: LayoutId;
  onChange: (layout: LayoutId) => void;
}

/** 프리셋의 셀 좌표를 그대로 축소해 그린 아이콘. 메인 칸은 진하게 표시한다. */
function LayoutGlyph({ preset }: { preset: LayoutPreset }) {
  return (
    <span
      aria-hidden
      className="grid h-3.5 w-5 gap-[1.5px]"
      style={{
        gridTemplateColumns: preset.cols.map((f) => `${f}fr`).join(" "),
        gridTemplateRows: preset.rows.map((f) => `${f}fr`).join(" "),
      }}
    >
      {preset.cells.map((c, i) => (
        <span
          key={i}
          className={cn(
            "rounded-[1.5px] bg-current",
            preset.hasMain && i > 0 && "opacity-50",
          )}
          style={{
            gridColumn: `${c.col + 1} / span ${c.colSpan}`,
            gridRow: `${c.row + 1} / span ${c.rowSpan}`,
          }}
        />
      ))}
    </span>
  );
}

export default function LayoutPicker({
  count,
  value,
  onChange,
}: LayoutPickerProps) {
  const presets = getPresets(count);
  if (presets.length < 2) return null;
  const active = resolveLayout(value, count).id;

  return (
    // 모바일은 세로 스택으로 고정이라 데스크톱에서만 노출한다.
    <div
      role="group"
      aria-label="화면 배치"
      className="bg-muted/60 hidden items-center gap-0.5 rounded-lg p-0.5 md:flex"
    >
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={p.id === active}
          aria-label={p.label}
          title={`${p.label} (L 키로 전환)`}
          onClick={() => onChange(p.id)}
          className={cn(
            "flex h-6 items-center justify-center rounded-md px-1.5 transition-colors",
            p.id === active
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGlyph preset={p} />
        </button>
      ))}
    </div>
  );
}
