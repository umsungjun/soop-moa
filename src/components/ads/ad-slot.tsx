"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ADSENSE_CLIENT_ID, ADSENSE_ENABLED, ADSENSE_SLOT_ID } from "./config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  className?: string;
}

/** 반응형 디스플레이 광고 한 칸. 채워지지 않으면(unfilled) 라벨까지 통째로 숨긴다. */
export default function AdSlot({ className }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = ref.current;
    // 같은 ins에 두 번 push하면 "All ins elements already have ads" 에러가 난다(StrictMode 재실행·재마운트).
    if (!ins || ins.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      /* 광고 차단기 등으로 스크립트가 없으면 무시 */
    }
  }, []);

  if (!ADSENSE_ENABLED || !ADSENSE_SLOT_ID) return null;

  return (
    <aside
      aria-label="광고"
      className={cn("has-[[data-ad-status=unfilled]]:hidden", className)}
    >
      <p className="text-muted-foreground/70 mb-1.5 text-[11px]">광고</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
