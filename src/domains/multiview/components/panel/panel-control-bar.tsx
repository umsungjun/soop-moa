"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MessageSquareOff,
  RefreshCw,
  X,
} from "lucide-react";
import type { PanelOptions } from "@/domains/multiview/types";
import { cn } from "@/lib/utils";

interface PanelControlBarProps {
  options: PanelOptions;
  onToggleChat: () => void;
  onReload: () => void;
  onRemove: () => void;
}

function CtrlButton({
  label,
  onClick,
  active,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        // 버튼을 키워 터치/클릭하기 쉽게 한다(size-9 + svg size-5).
        "flex size-9 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/20",
        active && "text-primary",
        danger && "hover:bg-destructive/80 hover:text-white",
        "[&_svg]:size-5",
      )}
    >
      {children}
    </button>
  );
}

export function PanelControlBar({
  options,
  onToggleChat,
  onReload,
  onRemove,
}: PanelControlBarProps) {
  // 컨트롤 접기 상태 — SOOP 플레이어를 가리지 않도록 작은 핸들로 접을 수 있다.
  const [collapsed, setCollapsed] = useState(false);

  // 모바일에선 항상 표시, 데스크톱에선 hover/focus 시에만 노출하는 공통 클래스.
  const reveal =
    "opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/panel:opacity-100 md:group-focus-within/panel:opacity-100";

  return (
    // 컨트롤 클러스터 — 상단 중앙 pill. SOOP 자체 컨트롤(주로 우상단)과 분리된다.
    <div
      className={cn(
        "pointer-events-auto absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-black/55 p-1.5 backdrop-blur-sm",
        reveal,
      )}
    >
      {collapsed ? (
        <CtrlButton label="컨트롤 펼치기" onClick={() => setCollapsed(false)}>
          <ChevronDown />
        </CtrlButton>
      ) : (
        <>
          <CtrlButton
            label={options.chat ? "채팅 숨기기" : "채팅 보기"}
            onClick={onToggleChat}
            active={options.chat}
          >
            {options.chat ? <MessageSquare /> : <MessageSquareOff />}
          </CtrlButton>
          <CtrlButton label="새로고침" onClick={onReload}>
            <RefreshCw />
          </CtrlButton>
          <CtrlButton label="패널 닫기" onClick={onRemove} danger>
            <X />
          </CtrlButton>
          <CtrlButton label="컨트롤 접기" onClick={() => setCollapsed(true)}>
            <ChevronUp />
          </CtrlButton>
        </>
      )}
    </div>
  );
}
