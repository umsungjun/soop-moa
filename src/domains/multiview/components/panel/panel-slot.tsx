"use client";

import { useState } from "react";
import type { Panel } from "@/domains/multiview/types";
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
  onToggleChat: () => void;
}

export function PanelSlot({
  panel,
  focused,
  canRemove,
  onFocus,
  onRequestAdd,
  onRemove,
  onToggleChat,
}: PanelSlotProps) {
  const [reloadNonce, setReloadNonce] = useState(0);

  return (
    // 포커스는 키보드 단축키(C·Delete)의 대상 패널을 정하는 데만 쓰고, 플레이어 위에 파란 테두리를 그리지 않는다. 상태는 data-focused로만 남긴다.
    <div
      data-focused={focused}
      onMouseDown={onFocus}
      className="group/panel ring-border relative size-full overflow-hidden rounded-lg ring-1"
    >
      {panel.bjId ? (
        <>
          <PanelControlBar
            options={panel.options}
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
