"use client";

import { useRouter } from "next/navigation";
import { mutate } from "swr";

/**
 * 로그아웃 공통 훅 — 세션 쿠키를 삭제하고 현재 화면에 비인증 상태를 반영한다.
 * 헤더(user-menu)와 /me 페이지 버튼이 함께 사용한다.
 *
 * 자동 로그인 리다이렉트(예전 /me의 redirect("/api/auth/login"))는 제거됐으므로
 * router.refresh()로 서버 컴포넌트만 재실행하면 된다 — 비인증 페이지는 로그아웃 상태를
 * 그대로 렌더한다(/me는 "로그인 필요" 화면). 더 이상 풀 리로드 우회가 필요 없다.
 */
export const useLogout = () => {
  const router = useRouter();

  return async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      await mutate("/api/auth/session"); // SWR 세션 캐시 무효화 → 헤더 등 클라이언트 갱신
      router.refresh(); // 서버 컴포넌트 재실행 → /me 등 서버 렌더 페이지 갱신
    }
  };
};
