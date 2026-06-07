"use client";

import { LiveBrowser } from "@/domains/live/components/live-browser";
import { MultiviewView } from "@/domains/multiview/components/multiview-view";

export default function MultiviewPage() {
  return (
    <MultiviewView
      renderLiveList={(onPick) => (
        <LiveBrowser onSelect={(b) => onPick(b.bjId)} stickyHeader dense />
      )}
    />
  );
}
