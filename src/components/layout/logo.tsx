import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withText?: boolean;
}

/** 4-quad "forest grid" mark — multiview (4 panels) + SOOP (forest greens). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="13" height="13" rx="3.5" fill="oklch(0.8 0.17 162)" />
      <rect x="17" y="2" width="13" height="13" rx="3.5" fill="oklch(0.7 0.15 168)" />
      <rect x="2" y="17" width="13" height="13" rx="3.5" fill="oklch(0.62 0.13 174)" />
      <rect x="17" y="17" width="13" height="13" rx="3.5" fill="oklch(0.55 0.11 180)" />
    </svg>
  );
}

export function Logo({ className, withText = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {withText && (
        <span className="text-base font-bold tracking-tight">
          SOOP <span className="text-primary">MOA</span>
        </span>
      )}
    </span>
  );
}
