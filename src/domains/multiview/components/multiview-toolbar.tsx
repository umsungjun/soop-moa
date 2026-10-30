"use client";

import {
  Headset,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MAX_PANELS } from "@/domains/multiview/constants";
import type { LayoutId } from "@/domains/multiview/types";
import LayoutPicker from "./layout-picker";

interface MultiviewToolbarProps {
  panelCount: number;
  filledCount: number;
  layout: LayoutId;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLayoutChange: (layout: LayoutId) => void;
  onResetLayout: () => void;
  onAddPanel: () => void;
  /** 채팅 문의 열기. 채널톡 키가 없으면 undefined라 버튼을 숨긴다. */
  onContact?: () => void;
}

export function MultiviewToolbar({
  panelCount,
  filledCount,
  layout,
  sidebarOpen,
  onToggleSidebar,
  onLayoutChange,
  onResetLayout,
  onAddPanel,
  onContact,
}: MultiviewToolbarProps) {
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("공유 링크를 복사했어요");
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  }

  return (
    <div className="bg-background/70 border-border/60 flex items-center gap-2 border-b px-3 py-2 backdrop-blur-xl">
      {/* 좌측 라이브 목록 사이드바 토글 — 데스크톱에서만 노출 */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden gap-1.5 md:inline-flex"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "목록 숨기기" : "목록 보기"}
      >
        {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        <span className="hidden lg:inline">목록</span>
      </Button>

      <Separator orientation="vertical" className="mx-1 hidden h-5 md:block" />

      <span className="text-muted-foreground text-sm">
        멀티뷰{" "}
        <span className="text-foreground tabular-nums font-medium">
          {filledCount}
        </span>
        <span className="text-muted-foreground">/{MAX_PANELS}</span>
      </span>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <LayoutPicker
        count={panelCount}
        value={layout}
        onChange={onLayoutChange}
      />

      {/* 배치는 그대로 두고 드래그한 비율만 기본값으로 되돌린다. */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={onResetLayout}
        aria-label="비율 초기화"
      >
        <RotateCcw />
        <span className="hidden sm:inline">비율 초기화</span>
      </Button>

      <div className="ml-auto flex items-center gap-1.5">
        {onContact ? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={onContact}
            aria-label="문의하기"
          >
            <Headset />
            <span className="hidden lg:inline">문의</span>
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={handleShare}
          aria-label="공유 링크 복사"
        >
          <Link2 />
          <span className="hidden sm:inline">공유</span>
        </Button>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={onAddPanel}
          disabled={panelCount >= MAX_PANELS}
        >
          <Plus />
          방송 추가
        </Button>
      </div>
    </div>
  );
}
