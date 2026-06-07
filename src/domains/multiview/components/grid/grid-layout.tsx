"use client";

import { Group, Panel } from "react-resizable-panels";
import { MIN_PANEL_SIZE } from "@/domains/multiview/constants";
import type { Panel as PanelData } from "@/domains/multiview/types";
import { ResizableSplitter } from "./resizable-splitter";

interface GridLayoutProps {
  panels: PanelData[];
  renderSlot: (panel: PanelData) => React.ReactNode;
  onResizingChange?: (resizing: boolean) => void;
}

const PANEL_CLS = "min-h-0 min-w-0";

export function GridLayout({
  panels,
  renderSlot,
  onResizingChange,
}: GridLayoutProps) {
  const groupHandlers = {
    onLayoutChange: () => onResizingChange?.(true),
    onLayoutChanged: () => onResizingChange?.(false),
  };

  const n = panels.length;

  if (n <= 1) {
    return (
      <div className="size-full">{panels[0] && renderSlot(panels[0])}</div>
    );
  }

  if (n === 2) {
    return (
      <Group orientation="horizontal" className="size-full" {...groupHandlers}>
        <Panel id="p0" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
          {renderSlot(panels[0])}
        </Panel>
        <ResizableSplitter orientation="horizontal" />
        <Panel id="p1" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
          {renderSlot(panels[1])}
        </Panel>
      </Group>
    );
  }

  if (n === 3) {
    return (
      <Group orientation="horizontal" className="size-full" {...groupHandlers}>
        <Panel id="left" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
          {renderSlot(panels[0])}
        </Panel>
        <ResizableSplitter orientation="horizontal" />
        <Panel id="right" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
          <Group
            orientation="vertical"
            className="size-full"
            {...groupHandlers}
          >
            <Panel id="r0" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
              {renderSlot(panels[1])}
            </Panel>
            <ResizableSplitter orientation="vertical" />
            <Panel id="r1" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
              {renderSlot(panels[2])}
            </Panel>
          </Group>
        </Panel>
      </Group>
    );
  }

  // n === 4 → 2 columns × 2 rows. Positions: 0=TL 1=TR 2=BL 3=BR
  return (
    <Group orientation="horizontal" className="size-full" {...groupHandlers}>
      <Panel id="col0" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
        <Group orientation="vertical" className="size-full" {...groupHandlers}>
          <Panel id="c0r0" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
            {renderSlot(panels[0])}
          </Panel>
          <ResizableSplitter orientation="vertical" />
          <Panel id="c0r1" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
            {renderSlot(panels[2])}
          </Panel>
        </Group>
      </Panel>
      <ResizableSplitter orientation="horizontal" />
      <Panel id="col1" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
        <Group orientation="vertical" className="size-full" {...groupHandlers}>
          <Panel id="c1r0" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
            {renderSlot(panels[1])}
          </Panel>
          <ResizableSplitter orientation="vertical" />
          <Panel id="c1r1" minSize={MIN_PANEL_SIZE} className={PANEL_CLS}>
            {renderSlot(panels[3])}
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
}
