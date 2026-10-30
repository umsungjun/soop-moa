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

/** 배치 계열. 패널 수별 실제 모양은 utils/layouts.ts의 프리셋이 정한다. */
export type LayoutId = "grid" | "main-top" | "main-left" | "columns";

/**
 * 드래그로 바꾼 트랙 분율. 길이는 현재 배치의 트랙 수와 같고, 패널 수나 배치가 바뀌면 초기화된다.
 *  - cols: 컬럼 분율
 *  - rows: 행 분율
 */
export interface LayoutSizes {
  cols?: number[];
  rows?: number[];
}

export interface MultiviewState {
  panels: Panel[]; // 1..MAX_PANELS, order = slot index (0 = 메인 칸)
  layout: LayoutId;
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
