"use client";

import { useEffect, useState } from "react";

/**
 * 값이 바뀐 뒤 delay(ms) 동안 추가 변경이 없을 때만 갱신되는 값을 돌려준다.
 * 입력에 즉시 반응해야 하는 UI(클라이언트 필터)와 비용이 드는 후속 동작(추가 페이지 로드)을 분리할 때 쓴다.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
