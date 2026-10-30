"use client";

import { useCallback, useSyncExternalStore } from "react";

// 서버 스냅샷은 false(데스크톱)다. 하이드레이션 직후 클라이언트 값으로 한 번 다시 그린다.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
