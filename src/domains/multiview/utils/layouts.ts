import { MIN_PANEL_SIZE } from "../constants";
import type { LayoutId, LayoutSizes, Panel } from "../types";

export const LAYOUT_IDS: readonly LayoutId[] = [
  "grid",
  "main-top",
  "main-left",
  "columns",
];

/** 0부터 시작하는 트랙 좌표. span은 차지하는 트랙 수. */
interface Cell {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

/** 분할선 한 토막. boundary 번째 트랙 경계에서 교차축 트랙 [from, to) 구간에만 놓인다. */
export interface Gutter {
  axis: "x" | "y";
  boundary: number;
  from: number;
  to: number;
}

export interface LayoutPreset {
  id: LayoutId;
  label: string;
  /** 0번 패널이 다른 칸보다 큰 배치인지. "메인으로" 동작을 노출할지 정한다. */
  hasMain: boolean;
  cols: number[];
  rows: number[];
  /** 패널 인덱스 순서의 셀 위치. */
  cells: Cell[];
  gutters: Gutter[];
}

const at = (col: number, row: number, colSpan = 1, rowSpan = 1): Cell => ({
  col,
  row,
  colSpan,
  rowSpan,
});

/** 경계를 가로지르는 셀이 없는 구간에만 분할선을 둔다. 예: 위 2·아래 1 배치의 세로 분할선은 윗줄에만 생긴다. */
const computeGutters = (cols: number[], rows: number[], cells: Cell[]) => {
  const out: Gutter[] = [];
  for (const axis of ["x", "y"] as const) {
    const lines = axis === "x" ? cols.length : rows.length;
    const cross = axis === "x" ? rows.length : cols.length;
    for (let b = 1; b < lines; b++) {
      let start = -1;
      for (let t = 0; t <= cross; t++) {
        const open =
          t < cross &&
          !cells.some((c) => {
            const [a0, a1, x0, x1] =
              axis === "x"
                ? [c.col, c.col + c.colSpan, c.row, c.row + c.rowSpan]
                : [c.row, c.row + c.rowSpan, c.col, c.col + c.colSpan];
            return a0 < b && a1 > b && x0 <= t && x1 > t;
          });
        if (open && start === -1) start = t;
        if (!open && start !== -1) {
          out.push({ axis, boundary: b, from: start, to: t });
          start = -1;
        }
      }
    }
  }
  return out;
};

const preset = (p: Omit<LayoutPreset, "gutters">): LayoutPreset => ({
  ...p,
  gutters: computeGutters(p.cols, p.rows, p.cells),
});

const THIRD = 1 / 3;

/** 패널 수별 배치. 각 목록의 첫 항목이 grid(기본)이고, 정의가 없는 계열은 grid로 그린다. */
const PRESETS: Record<number, LayoutPreset[]> = {
  1: [
    preset({
      id: "grid",
      label: "전체 화면",
      hasMain: false,
      cols: [1],
      rows: [1],
      cells: [at(0, 0)],
    }),
  ],
  2: [
    preset({
      id: "grid",
      label: "좌우 분할",
      hasMain: false,
      cols: [0.5, 0.5],
      rows: [1],
      cells: [at(0, 0), at(1, 0)],
    }),
    preset({
      id: "main-top",
      label: "상하 분할",
      hasMain: false,
      cols: [1],
      rows: [0.5, 0.5],
      cells: [at(0, 0), at(0, 1)],
    }),
  ],
  3: [
    preset({
      id: "grid",
      label: "위 2 · 아래 1",
      hasMain: false,
      cols: [0.5, 0.5],
      rows: [0.5, 0.5],
      cells: [at(0, 0), at(1, 0), at(0, 1, 2)],
    }),
    preset({
      id: "main-top",
      label: "메인 위 · 아래 2",
      hasMain: true,
      cols: [0.5, 0.5],
      rows: [0.6, 0.4],
      cells: [at(0, 0, 2), at(0, 1), at(1, 1)],
    }),
    preset({
      id: "main-left",
      label: "메인 왼쪽 · 오른쪽 2",
      hasMain: true,
      cols: [0.6, 0.4],
      rows: [0.5, 0.5],
      cells: [at(0, 0, 1, 2), at(1, 0), at(1, 1)],
    }),
    preset({
      id: "columns",
      label: "가로 3열",
      hasMain: false,
      cols: [THIRD, THIRD, THIRD],
      rows: [1],
      cells: [at(0, 0), at(1, 0), at(2, 0)],
    }),
  ],
  4: [
    preset({
      id: "grid",
      label: "2×2 4분할",
      hasMain: false,
      cols: [0.5, 0.5],
      rows: [0.5, 0.5],
      cells: [at(0, 0), at(1, 0), at(0, 1), at(1, 1)],
    }),
    // 아래 칸 3개가 16:9에 가깝도록 메인 2/3 · 줄 1/3로 나눈다.
    preset({
      id: "main-top",
      label: "메인 위 · 아래 3",
      hasMain: true,
      cols: [THIRD, THIRD, THIRD],
      rows: [2 * THIRD, THIRD],
      cells: [at(0, 0, 3), at(0, 1), at(1, 1), at(2, 1)],
    }),
    preset({
      id: "main-left",
      label: "메인 왼쪽 · 오른쪽 3",
      hasMain: true,
      cols: [2 * THIRD, THIRD],
      rows: [THIRD, THIRD, THIRD],
      cells: [at(0, 0, 1, 3), at(1, 0), at(1, 1), at(1, 2)],
    }),
    preset({
      id: "columns",
      label: "가로 4열",
      hasMain: false,
      cols: [0.25, 0.25, 0.25, 0.25],
      rows: [1],
      cells: [at(0, 0), at(1, 0), at(2, 0), at(3, 0)],
    }),
  ],
};

export const isLayoutId = (v: unknown): v is LayoutId =>
  LAYOUT_IDS.includes(v as LayoutId);

export const DEFAULT_LAYOUT: LayoutId = "grid";

export const getPresets = (count: number): LayoutPreset[] =>
  PRESETS[Math.min(Math.max(count, 1), 4)];

/** 고른 계열이 이 패널 수에 없으면 grid로 그린다. 계열은 state에 그대로 남아 패널 수가 돌아오면 복원된다. */
export const resolveLayout = (id: LayoutId, count: number): LayoutPreset => {
  const list = getPresets(count);
  return list.find((p) => p.id === id) ?? list[0];
};

/** 저장된 분율이 이 배치의 트랙 수와 맞을 때만 쓴다. 이전 버전 localStorage 값이나 다른 배치의 값은 기본 분율로 돌린다. */
export const resolveTracks = (
  saved: number[] | undefined,
  fallback: number[],
): number[] => {
  if (!saved || saved.length !== fallback.length) return fallback;
  if (!saved.every((v) => Number.isFinite(v) && v > 0)) return fallback;
  const sum = saved.reduce((a, b) => a + b, 0);
  return saved.map((v) => v / sum);
};

export const resolveSizes = (sizes: LayoutSizes, p: LayoutPreset) => ({
  cols: resolveTracks(sizes.cols, p.cols),
  rows: resolveTracks(sizes.rows, p.rows),
});

const MIN = MIN_PANEL_SIZE / 100;

/** 경계 boundary를 위치 at(0..1)으로 옮긴다. 양옆 두 트랙의 합은 유지하고 각각 MIN 이상으로 묶는다. */
export const moveBoundary = (
  tracks: number[],
  boundary: number,
  at: number,
): number[] => {
  const a = boundary - 1;
  const start = tracks.slice(0, a).reduce((s, v) => s + v, 0);
  const pair = tracks[a] + tracks[boundary];
  const first = Math.min(pair - MIN, Math.max(MIN, at - start));
  const next = tracks.slice();
  next[a] = first;
  next[boundary] = pair - first;
  return next;
};

/**
 * 패널을 id 순으로 고정한 렌더 순서. 위치는 index로만 정한다.
 * DOM 노드를 옮기면 iframe이 새로 로드되므로, 패널 순서를 바꿔도(메인으로 올리기) DOM 순서는 그대로 둬야 한다.
 */
export const stableOrder = (panels: Panel[]) =>
  panels
    .map((panel, index) => ({ panel, index }))
    .sort((a, b) => (a.panel.id < b.panel.id ? -1 : 1));
