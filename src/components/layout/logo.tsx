import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/** 4분할 블루 그리드 마크 — 랜딩 페이지의 장식용 모티프로 사용. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="13"
        height="13"
        rx="3.5"
        fill="oklch(0.74 0.14 235)"
      />
      <rect
        x="17"
        y="2"
        width="13"
        height="13"
        rx="3.5"
        fill="oklch(0.67 0.15 245)"
      />
      <rect
        x="2"
        y="17"
        width="13"
        height="13"
        rx="3.5"
        fill="oklch(0.6 0.15 255)"
      />
      <rect
        x="17"
        y="17"
        width="13"
        height="13"
        rx="3.5"
        fill="oklch(0.52 0.14 262)"
      />
    </svg>
  );
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
