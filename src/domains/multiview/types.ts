export type PanelId = string;

export interface PanelOptions {
  muted: boolean;
  chat: boolean;
}

export interface Panel {
  id: PanelId;
  bjId: string | null; // null = empty slot
  options: PanelOptions;
}

/**
 * Resize ratios per layout group. Topology is fixed per panel count;
 * only the drag ratios are stored here (and persisted to localStorage).
 *  - root: outer horizontal split ratios
 *  - colA / colB: inner vertical split ratios (3/4-panel layouts)
 */
export interface LayoutSizes {
  root?: number[];
  colA?: number[];
  colB?: number[];
}

export interface MultiviewState {
  panels: Panel[]; // 1..MAX_PANELS, order = slot index
  sizes: LayoutSizes;
  focusedId: PanelId | null;
  globalMuted: boolean;
}

export interface RecentStream {
  bjId: string;
  bjNick?: string;
  thumbnail?: string;
  at: number;
}
