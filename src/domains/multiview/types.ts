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
 * CSS 그리드 분할 비율. 토폴로지는 패널 수마다 고정이고, 드래그 비율만 저장된다.
 * 패널 수가 바뀌면 비율은 초기화된다(localStorage에 영속).
 *  - cols: 좌/우 컬럼 분율 [c0, c1] (2·3·4분할)
 *  - rows: 상/하 행 분율 [r0, r1] (3·4분할)
 */
export interface LayoutSizes {
  cols?: number[];
  rows?: number[];
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
