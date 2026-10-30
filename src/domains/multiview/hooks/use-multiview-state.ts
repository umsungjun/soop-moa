"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LS_KEY_STATE, MAX_PANELS } from "../constants";
import type {
  LayoutId,
  LayoutSizes,
  MultiviewState,
  PanelOptions,
} from "../types";
import { DEFAULT_LAYOUT, isLayoutId } from "../utils/layouts";
import {
  decodeLayout,
  decodePanels,
  encodeLayout,
  encodePanels,
  newPanel,
} from "../utils/url-codec";

function defaultState(): MultiviewState {
  return {
    panels: [newPanel(null)],
    layout: DEFAULT_LAYOUT,
    sizes: {},
    focusedId: null,
    globalMuted: false,
  };
}

function loadFromLocalStorage(): MultiviewState | null {
  try {
    const raw = localStorage.getItem(LS_KEY_STATE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MultiviewState;
    if (!Array.isArray(parsed.panels) || parsed.panels.length === 0)
      return null;
    // layout 필드가 없던 이전 버전 저장값도 그대로 복원한다.
    return {
      ...parsed,
      layout: isLayoutId(parsed.layout) ? parsed.layout : DEFAULT_LAYOUT,
    };
  } catch {
    return null;
  }
}

export function useMultiviewState() {
  const [state, setState] = useState<MultiviewState | null>(null);
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Hydrate once on mount: URL → localStorage → default ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decoded = decodePanels(params.get("v"), params.get("o"));
    if (decoded) {
      // URL·localStorage는 브라우저에만 있어 마운트 후에 읽어야 SSR과 어긋나지 않는다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        panels: decoded.slice(0, MAX_PANELS),
        layout: decodeLayout(params.get("l")),
        sizes: {},
        focusedId: decoded[0]?.id ?? null,
        globalMuted: false,
      });
      return;
    }
    setState(loadFromLocalStorage() ?? defaultState());
  }, []);

  // ── Persist: URL (debounced) + localStorage (debounced) ──
  useEffect(() => {
    if (!state) return;

    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const { v, o } = encodePanels(state.panels);
      const params = new URLSearchParams();
      params.set("v", v);
      params.set("o", o);
      const l = encodeLayout(state.layout);
      if (l) params.set("l", l);
      window.history.replaceState(null, "", `?${params.toString()}`);
    }, 300);

    if (lsTimer.current) clearTimeout(lsTimer.current);
    lsTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY_STATE, JSON.stringify(state));
      } catch {
        /* ignore quota errors */
      }
    }, 800);

    return () => {
      if (urlTimer.current) clearTimeout(urlTimer.current);
      if (lsTimer.current) clearTimeout(lsTimer.current);
    };
  }, [state]);

  const update = useCallback((fn: (prev: MultiviewState) => MultiviewState) => {
    setState((prev) => (prev ? fn(prev) : prev));
  }, []);

  // ── Actions ──
  const assignToPanel = useCallback(
    (panelId: string, bjId: string) => {
      update((prev) => {
        // 같은 방송이 다른 패널에 이미 있으면 중복 추가하지 않는다.
        if (prev.panels.some((p) => p.bjId === bjId && p.id !== panelId))
          return prev;
        return {
          ...prev,
          panels: prev.panels.map((p) =>
            p.id === panelId ? { ...p, bjId } : p,
          ),
          focusedId: panelId,
        };
      });
    },
    [update],
  );

  /** Fills the first empty slot, otherwise appends a new panel (up to MAX). */
  const addStream = useCallback(
    (bjId: string) => {
      update((prev) => {
        // 이미 시청 중인 방송은 중복 추가하지 않는다.
        if (prev.panels.some((p) => p.bjId === bjId)) return prev;
        const emptyIdx = prev.panels.findIndex((p) => p.bjId === null);
        if (emptyIdx !== -1) {
          const panels = prev.panels.slice();
          panels[emptyIdx] = { ...panels[emptyIdx], bjId };
          return { ...prev, panels, focusedId: panels[emptyIdx].id };
        }
        if (prev.panels.length >= MAX_PANELS) return prev;
        const p = newPanel(bjId);
        // 패널 수가 바뀌면 분할 비율 초기화.
        return {
          ...prev,
          panels: [...prev.panels, p],
          sizes: {},
          focusedId: p.id,
        };
      });
    },
    [update],
  );

  const addEmptyPanel = useCallback(() => {
    update((prev) => {
      if (prev.panels.length >= MAX_PANELS) return prev;
      const p = newPanel(null);
      // 패널 수가 바뀌면 분할 비율 초기화.
      return {
        ...prev,
        panels: [...prev.panels, p],
        sizes: {},
        focusedId: p.id,
      };
    });
  }, [update]);

  const removePanel = useCallback(
    (panelId: string) => {
      update((prev) => {
        const panels = prev.panels.filter((p) => p.id !== panelId);
        const next = panels.length > 0 ? panels : [newPanel(null)];
        return {
          ...prev,
          panels: next,
          sizes: {}, // topology changed → reset ratios
          focusedId: prev.focusedId === panelId ? next[0].id : prev.focusedId,
        };
      });
    },
    [update],
  );

  const setOptions = useCallback(
    (panelId: string, patch: Partial<PanelOptions>) => {
      update((prev) => ({
        ...prev,
        panels: prev.panels.map((p) =>
          p.id === panelId ? { ...p, options: { ...p.options, ...patch } } : p,
        ),
      }));
    },
    [update],
  );

  const toggleMute = useCallback(
    (panelId: string) => {
      update((prev) => ({
        ...prev,
        panels: prev.panels.map((p) =>
          p.id === panelId
            ? { ...p, options: { ...p.options, muted: !p.options.muted } }
            : p,
        ),
      }));
    },
    [update],
  );

  const toggleChat = useCallback(
    (panelId: string) => {
      update((prev) => ({
        ...prev,
        panels: prev.panels.map((p) =>
          p.id === panelId
            ? { ...p, options: { ...p.options, chat: !p.options.chat } }
            : p,
        ),
      }));
    },
    [update],
  );

  const setFocus = useCallback(
    (panelId: string | null) => {
      // 패널을 누를 때마다 호출되므로 같은 값이면 prev를 그대로 돌려 리렌더·저장을 건너뛴다.
      update((prev) =>
        prev.focusedId === panelId ? prev : { ...prev, focusedId: panelId },
      );
    },
    [update],
  );

  const swapPanels = useCallback(
    (aId: string, bId: string) => {
      update((prev) => {
        const a = prev.panels.findIndex((p) => p.id === aId);
        const b = prev.panels.findIndex((p) => p.id === bId);
        if (a === -1 || b === -1) return prev;
        const panels = prev.panels.slice();
        [panels[a], panels[b]] = [panels[b], panels[a]];
        return { ...prev, panels };
      });
    },
    [update],
  );

  const setGlobalMuted = useCallback(
    (muted: boolean) => {
      update((prev) => ({
        ...prev,
        globalMuted: muted,
        panels: prev.panels.map((p) => ({
          ...p,
          options: { ...p.options, muted },
        })),
      }));
    },
    [update],
  );

  const setSizes = useCallback(
    (patch: Partial<LayoutSizes>) => {
      update((prev) => ({ ...prev, sizes: { ...prev.sizes, ...patch } }));
    },
    [update],
  );

  const setLayout = useCallback(
    (layout: LayoutId) => {
      // 트랙 수가 달라지므로 분율도 함께 초기화.
      update((prev) =>
        prev.layout === layout ? prev : { ...prev, layout, sizes: {} },
      );
    },
    [update],
  );

  const reset = useCallback(() => {
    update((prev) => ({ ...prev, sizes: {} }));
  }, [update]);

  // 액션 객체를 고정해 이를 의존하는 effect(단축키 등)가 렌더마다 재구독되지 않게 한다.
  const actions = useMemo(
    () => ({
      assignToPanel,
      addStream,
      addEmptyPanel,
      removePanel,
      setOptions,
      toggleMute,
      toggleChat,
      setFocus,
      swapPanels,
      setGlobalMuted,
      setSizes,
      setLayout,
      reset,
    }),
    [
      assignToPanel,
      addStream,
      addEmptyPanel,
      removePanel,
      setOptions,
      toggleMute,
      toggleChat,
      setFocus,
      swapPanels,
      setGlobalMuted,
      setSizes,
      setLayout,
      reset,
    ],
  );

  return { state, actions };
}

export type MultiviewActions = ReturnType<typeof useMultiviewState>["actions"];
