"use client";

import { Link2, Plus, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MAX_PANELS } from "@/domains/multiview/constants";

interface MultiviewToolbarProps {
  panelCount: number;
  filledCount: number;
  globalMuted: boolean;
  onToggleGlobalMute: () => void;
  onResetLayout: () => void;
  onAddPanel: () => void;
}

export function MultiviewToolbar({
  panelCount,
  filledCount,
  globalMuted,
  onToggleGlobalMute,
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
        onClick={onToggleGlobalMute}
      >
        {globalMuted ? <VolumeX /> : <Volume2 />}
        <span className="hidden sm:inline">
          {globalMuted ? "전체 음소거" : "소리 켜짐"}
        </span>
      </Button>

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
