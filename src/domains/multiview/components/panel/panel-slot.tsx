"use client";

import { useState } from "react";
import type { Panel } from "@/domains/multiview/types";
import { cn } from "@/lib/utils";
import { PanelControlBar } from "./panel-control-bar";
import { PanelEmptyState } from "./panel-empty-state";
import { PanelPlayer } from "./panel-player";

interface PanelSlotProps {
  panel: Panel;
  focused: boolean;
  canRemove: boolean;
  onFocus: () => void;
  onRequestAdd: () => void;
  onRemove: () => void;
  onToggleMute: () => void;
  onToggleChat: () => void;
}

export function PanelSlot({
  panel,
  focused,
  canRemove,
  onFocus,
  onRequestAdd,
  onRemove,
  onToggleMute,
  onToggleChat,
}: PanelSlotProps) {
  const [reloadNonce, setReloadNonce] = useState(0);

  return (
    <div
      data-focused={focused}
      onMouseDown={onFocus}
      className={cn(
        "group/panel ring-border relative size-full overflow-hidden rounded-lg ring-1 transition-shadow",
        focused &&
          panel.bjId &&
          "ring-primary ring-2 shadow-[0_0_24px_-6px_var(--primary)]",
      )}
    >
      {panel.bjId ? (
        <>
          <PanelControlBar
            bjId={panel.bjId}
            options={panel.options}
            onToggleMute={onToggleMute}
            onToggleChat={onToggleChat}
            onReload={() => setReloadNonce((n) => n + 1)}
            onRemove={onRemove}
          />
          <PanelPlayer
            bjId={panel.bjId}
            options={panel.options}
            reloadNonce={reloadNonce}
          />
        </>
      ) : (
        <PanelEmptyState
          onAdd={onRequestAdd}
          onRemove={onRemove}
          canRemove={canRemove}
        />
      )}
    </div>
  );
}
