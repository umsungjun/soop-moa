"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
  /** 좁은 화면에서 라벨을 숨기고 아이콘만 남긴다(헤더용). 접근성 이름은 aria-label로 유지된다. */
  compact?: boolean;
}

export function LoginButton({
  className,
  size = "default",
  label = "SOOP 로그인",
  compact = false,
}: LoginButtonProps) {
  return (
    <Button
      size={size}
      className={cn("gap-1.5", className)}
      nativeButton={false}
      // OAuth 진입점은 색인 대상이 아니라 nofollow. robots.txt의 /api/ 차단과 함께 이중으로 막는다.
      render={<a href="/api/auth/login" rel="nofollow" aria-label={label} />}
    >
      <LogIn />
      <span className={cn(compact && "hidden sm:inline")}>{label}</span>
    </Button>
  );
}
