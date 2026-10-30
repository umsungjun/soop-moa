"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // 서버에선 false, 클라이언트에선 true. 테마는 클라이언트에서만 알 수 있어 그 전엔 기본 아이콘을 그린다.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="테마 전환"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-6" />
        ) : (
          <Moon className="size-6" />
        )
      ) : (
        <Sun className="size-6" />
      )}
    </Button>
  );
}
