"use client";

import {
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

interface MultiviewToolbarProps {
  panelCount: number;
  filledCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onResetLayout: () => void;
  onAddPanel: () => void;
}

export function MultiviewToolbar({
  panelCount,
  filledCount,
  sidebarOpen,
  onToggleSidebar,
  onResetLayout,
  onAddPanel,
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

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={onResetLayout}
      >
        <RotateCcw />
        <span className="hidden sm:inline">레이아웃 초기화</span>
      </Button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={handleShare}
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
