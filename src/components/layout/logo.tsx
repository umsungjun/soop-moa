import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/** 브랜드 워드마크(텍스트 전용) — 헤더에서 사용. */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        "text-base font-bold tracking-tight whitespace-nowrap",
        className,
      )}
    >
      SOOP <span className="text-primary">모아</span>
    </span>
  );
}
