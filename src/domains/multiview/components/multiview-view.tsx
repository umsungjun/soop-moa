"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MAX_PANELS } from "@/domains/multiview/constants";
import { useMultiviewState } from "@/domains/multiview/hooks/use-multiview-state";
import type { Panel as PanelData } from "@/domains/multiview/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { AddStreamDialog } from "./add-stream/add-stream-dialog";
import { GridLayout } from "./grid/grid-layout";
import { MobileStack } from "./grid/mobile-stack";
import { HdAccessNotice } from "./hd-access-notice";
import { LiveSidebar } from "./live-sidebar/live-sidebar";
import { MultiviewToolbar } from "./multiview-toolbar";
import { PanelSlot } from "./panel/panel-slot";

interface MultiviewViewProps {
  /** Live browser slot injected by the app layer (keeps domains decoupled). */
  renderLiveList: (onPick: (bjId: string) => void) => React.ReactNode;
}

export function MultiviewView({ renderLiveList }: MultiviewViewProps) {
  const { state, actions } = useMultiviewState();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isResizing, setIsResizing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetPanelId, setTargetPanelId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const openAddForPanel = useCallback((panelId: string) => {
    setTargetPanelId(panelId);
    setDialogOpen(true);
  }, []);

  const openAddNew = useCallback(() => {
    setTargetPanelId(null);
    setDialogOpen(true);
  }, []);

  const handlePick = useCallback(
    (bjId: string) => {
      // 같은 방송이 다른 패널에 이미 있으면 그 패널로 포커스만 옮긴다.
      const existing = state?.panels.find(
        (p) => p.bjId === bjId && p.id !== targetPanelId,
      );
      if (existing) {
        actions.setFocus(existing.id);
        toast.info("이미 추가된 방송이에요");
        return;
      }
      if (targetPanelId) actions.assignToPanel(targetPanelId, bjId);
      else actions.addStream(bjId);
    },
    [actions, targetPanelId, state],
  );

  // 사이드바에서 추가 — 중복이면 기존 패널 포커스, 가득 찼으면 알린다.
  const handleSidebarPick = useCallback(
    (bjId: string) => {
      if (!state) return;
      const existing = state.panels.find((p) => p.bjId === bjId);
      if (existing) {
        actions.setFocus(existing.id);
        toast.info("이미 추가된 방송이에요");
        return;
      }
      const full =
        state.panels.length >= MAX_PANELS && state.panels.every((p) => p.bjId);
      if (full) {
        toast.error(`패널은 최대 ${MAX_PANELS}개까지 추가할 수 있어요`);
        return;
      }
      actions.addStream(bjId);
    },
    [actions, state],
  );

  // ── Keyboard shortcuts ──
  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        dialogOpen ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      const s = state!;
      if (e.key >= "1" && e.key <= "4") {
        const idx = Number(e.key) - 1;
        if (s.panels[idx]) actions.setFocus(s.panels[idx].id);
      } else if (e.key === "c" || e.key === "C") {
        if (s.focusedId) actions.toggleChat(s.focusedId);
      } else if (e.key === "+" || e.key === "=") {
        openAddNew();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (s.focusedId) actions.removePanel(s.focusedId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, actions, dialogOpen, openAddNew]);

  const renderSlot = useCallback(
    (panel: PanelData) => (
      <PanelSlot
        panel={panel}
        // 모바일 세로 스택은 한 번에 한 화면씩 보므로 포커스 링(파란 테두리)을 띄우지 않는다.
        focused={!isMobile && state?.focusedId === panel.id}
        canRemove={(state?.panels.length ?? 1) > 1}
        onFocus={() => actions.setFocus(panel.id)}
        onRequestAdd={() => openAddForPanel(panel.id)}
        onRemove={() => actions.removePanel(panel.id)}
        onToggleChat={() => actions.toggleChat(panel.id)}
      />
    ),
    [state, actions, openAddForPanel, isMobile],
  );

  if (!state) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        불러오는 중…
      </div>
    );
  }

  const filledCount = state.panels.filter((p) => p.bjId).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MultiviewToolbar
        panelCount={state.panels.length}
        filledCount={filledCount}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onResetLayout={actions.reset}
        onAddPanel={openAddNew}
      />

      <HdAccessNotice />

      <div className="flex min-h-0 flex-1">
        {/* 좌측 라이브 사이드바 — 데스크톱 + 열림 상태에서만. 모바일은 추가 다이얼로그 사용. */}
        {!isMobile && sidebarOpen ? (
          <LiveSidebar
            onPick={handleSidebarPick}
            onClose={() => setSidebarOpen(false)}
            renderLiveList={renderLiveList}
          />
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 p-2",
            isResizing && "[&_iframe]:pointer-events-none",
          )}
        >
          {isMobile ? (
            <MobileStack
              panels={state.panels}
              onAddPanel={openAddNew}
              renderSlot={renderSlot}
            />
          ) : (
            <GridLayout
              panels={state.panels}
              sizes={state.sizes}
              renderSlot={renderSlot}
              onSizesChange={actions.setSizes}
              onResizingChange={setIsResizing}
            />
          )}
        </div>
      </div>

      <AddStreamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPick={handlePick}
        renderLiveList={renderLiveList}
      />
    </div>
  );
}
