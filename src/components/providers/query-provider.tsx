"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * TanStack Query 프로바이더 — /live 무한 스크롤에서 useInfiniteQuery를 쓰기 위해 도입.
 * 기존 SWR 훅(세션·카테고리)은 그대로 두고 이 라이브러리는 무한 스크롤에만 사용한다.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState 초기화 함수로 클라이언트를 한 번만 생성(리렌더 시 재생성 방지).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000, // API 라우트의 s-maxage=20과 맞춤
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
