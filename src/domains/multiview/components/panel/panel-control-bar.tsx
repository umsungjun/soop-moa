"use client";

import {
  MessageSquare,
  MessageSquareOff,
  RefreshCw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelOptions } from "@/domains/multiview/types";

interface PanelControlBarProps {
  bjId: string;
  options: PanelOptions;
  onToggleMute: () => void;
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
        "flex size-7 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15",
        active && "text-primary",
        danger && "hover:bg-destructive/80 hover:text-white",
        "[&_svg]:size-4",
      )}
    >
      {children}
    </button>
  );
}

export function PanelControlBar({
  bjId,
  options,
  onToggleMute,
  onToggleChat,
  onReload,
  onRemove,
}: PanelControlBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-1 bg-linear-to-b from-black/70 to-transparent p-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/panel:opacity-100 md:group-focus-within/panel:opacity-100">
      <span className="pointer-events-none truncate font-mono text-xs font-medium text-white/90">
        {bjId}
      </span>
      <div className="pointer-events-auto ml-auto flex items-center gap-0.5">
        <CtrlButton
          label={options.muted ? "음소거 해제" : "음소거"}
          onClick={onToggleMute}
        >
          {options.muted ? <VolumeX /> : <Volume2 />}
        </CtrlButton>
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
      </div>
    </div>
  );
}
