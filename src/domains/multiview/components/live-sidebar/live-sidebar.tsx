"use client";

import { PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectIdTab } from "@/domains/multiview/components/add-stream/direct-id-tab";

interface LiveSidebarProps {
  /** 방송 추가 콜백(빈 슬롯을 채우거나 새 패널로 추가). */
  onPick: (bjId: string) => void;
  /** 사이드바 접기. */
  onClose: () => void;
  /**
   * 라이브 목록 렌더 슬롯 — 앱 레이어가 주입해 live↔multiview 도메인 결합을 피한다.
   * 내부 LiveBrowser가 검색·카테고리·정렬·무한스크롤을 모두 제공한다.
   */
  renderLiveList: (onPick: (bjId: string) => void) => React.ReactNode;
}

export function LiveSidebar({ onPick, onClose, renderLiveList }: LiveSidebarProps) {
  return (
    <aside className="border-border/60 bg-background/40 flex w-80 shrink-0 flex-col border-r">
      <div className="border-border/60 flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="text-sm font-medium">방송 추가</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="목록 접기"
          title="목록 접기"
        >
          <PanelLeftClose />
        </Button>
      </div>

      {/* BJ 아이디·주소 직접 추가 (목록에 없는 방송용). 상시 노출이라 자동 포커스 끔. */}
      <div className="border-border/60 border-b px-3 pt-3 pb-2">
        <DirectIdTab onSubmit={onPick} autoFocus={false} />
      </div>

      {/* 검색 가능한 라이브 목록 — 카드 클릭 시 추가.
          상단 패딩은 두지 않는다(sticky 헤더 위 빈 공간 방지). 여백은 헤더 내부에서 처리. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {renderLiveList(onPick)}
      </div>
    </aside>
  );
}
