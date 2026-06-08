"use client";

import { Plus } from "lucide-react";
import { MAX_PANELS } from "@/domains/multiview/constants";
import type { Panel as PanelData } from "@/domains/multiview/types";

interface MobileStackProps {
  panels: PanelData[];
  onAddPanel: () => void;
  renderSlot: (panel: PanelData) => React.ReactNode;
}

/**
 * 모바일 세로 스택 — 좁은 화면에선 분할 그리드 대신 모든 패널을 16:9 너비 맞춤으로 세로로 쌓고 스크롤한다.
 * 각 슬롯은 aspect-video로 화면 너비에 맞춰 높이가 정해지고, shrink-0으로 눌리지 않아 컨테이너가 세로 스크롤된다.
 */
export function MobileStack({
  panels,
  onAddPanel,
  renderSlot,
}: MobileStackProps) {
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto">
      {panels.map((panel) => (
        <div key={panel.id} className="aspect-video w-full shrink-0">
          {renderSlot(panel)}
        </div>
      ))}

      {panels.length < MAX_PANELS ? (
        <button
          type="button"
          onClick={onAddPanel}
          aria-label="패널 추가"
          className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm font-medium transition-colors"
        >
          <Plus className="size-5" />
          방송 추가
        </button>
      ) : null}
    </div>
  );
}
