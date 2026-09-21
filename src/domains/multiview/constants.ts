export const MAX_PANELS = 4;
export const MIN_PANEL_SIZE = 15; // percent

export const DEFAULT_PANEL_OPTIONS = {
  // 기본은 음소거 해제 — 음소거는 SOOP 플레이어 자체 컨트롤로 처리한다.
  muted: false,
  chat: false,
} as const;

export const LS_KEY_STATE = "soop-moa:multiview:v1";
export const LS_KEY_RECENT = "soop-moa:multiview:recent";
export const RECENT_MAX = 12;

/** 크롬·엣지 로컬 네트워크 정책으로 고화질 시청이 막힐 때 안내하는 SOOP 공지. 멀티뷰 안내 배너와 가이드 페이지가 함께 참조한다. */
export const HD_ACCESS_NOTICE_URL =
  "https://sotong.sooplive.com/?board_type=servicenotice&work=view&b_no=9569";
