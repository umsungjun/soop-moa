"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession } from "@/domains/auth/hooks/use-session";
import { Button } from "@/components/ui/button";

/** /me 페이지의 로그아웃 버튼 — user-menu.tsx의 로그아웃 흐름을 재사용한다. */
export function LogoutButton() {
  const router = useRouter();
  const { mutate } = useSession();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await mutate(); // SWR 세션 캐시 무효화
    } finally {
      // 네트워크 실패와 무관하게 홈으로 이동하고 서버 렌더 상태를 갱신한다.
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleLogout}>
      <LogOut />
      로그아웃
    </Button>
  );
}
