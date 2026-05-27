"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { Panel as PanelData } from "@/domains/multiview/types";
import { useMultiviewState } from "@/domains/multiview/hooks/use-multiview-state";
import { AddStreamDialog } from "./add-stream/add-stream-dialog";
import { GridLayout } from "./grid/grid-layout";
import { MobileStack } from "./grid/mobile-stack";
import { PanelSlot } from "./panel/panel-slot";
import { MultiviewToolbar } from "./multiview-toolbar";

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
      if (targetPanelId) actions.assignToPanel(targetPanelId, bjId);
      else actions.addStream(bjId);
    },
    [actions, targetPanelId],
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
      } else if (e.key === "m" || e.key === "M") {
        if (e.shiftKey) actions.setGlobalMuted(!s.globalMuted);
        else if (s.focusedId) actions.toggleMute(s.focusedId);
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
        focused={state?.focusedId === panel.id}
        canRemove={(state?.panels.length ?? 1) > 1}
        onFocus={() => actions.setFocus(panel.id)}
        onRequestAdd={() => openAddForPanel(panel.id)}
        onRemove={() => actions.removePanel(panel.id)}
        onToggleMute={() => actions.toggleMute(panel.id)}
        onToggleChat={() => actions.toggleChat(panel.id)}
      />
    ),
    [state, actions, openAddForPanel],
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
        globalMuted={state.globalMuted}
        onToggleGlobalMute={() => actions.setGlobalMuted(!state.globalMuted)}
        onResetLayout={actions.reset}
        onAddPanel={openAddNew}
      />

      <div
        className={cn(
          "min-h-0 flex-1 p-2",
          isResizing && "[&_iframe]:pointer-events-none",
        )}
      >
        {isMobile ? (
          <MobileStack
            panels={state.panels}
            activeId={state.focusedId}
            onActivate={actions.setFocus}
            onAddPanel={openAddNew}
            renderSlot={renderSlot}
          />
        ) : (
          <GridLayout
            panels={state.panels}
            renderSlot={renderSlot}
            onResizingChange={setIsResizing}
          />
        )}
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
