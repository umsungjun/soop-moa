"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/domains/auth/hooks/use-logout";

/** /me 페이지의 로그아웃 버튼 — 로그아웃 흐름은 useLogout으로 공통화. */
export function LogoutButton() {
  const logout = useLogout();

  return (
    <Button variant="destructive" size="sm" onClick={logout}>
      <LogOut />
      로그아웃
    </Button>
  );
}
