import Image from "next/image";
import { Radio, Users } from "lucide-react";
import type { LiveBroadcast } from "@/domains/live/types";
import { cn } from "@/lib/utils";
import { formatViewerCount } from "@/utils/format";

interface PreviewGridProps {
  broadcasts: LiveBroadcast[];
  /** 한 변의 칸 수. 2→2×2(4), 3→3×3(9), 4→4×4(16). */
  columns?: 2 | 3 | 4;
}

// Tailwind v4는 동적으로 조합한 클래스 문자열을 퍼지하므로 고정 클래스로 매핑한다.
const GRID_COLS: Record<NonNullable<PreviewGridProps["columns"]>, string> = {
  2: "grid-cols-2 grid-rows-2",
  3: "grid-cols-3 grid-rows-3",
  4: "grid-cols-4 grid-rows-4",
};

/**
 * 홈 히어로의 미리보기 그리드 — 시청자 많은 실시간 방송 썸네일을 N×N으로 채운다.
 * 제목/닉네임 없이 썸네일 중심의 컴팩트 셀이라 aspect-video 박스에 들어간다.
 * 서버 컴포넌트(클릭은 단순 링크 이동이라 클라이언트 핸들러 불필요).
 */
export function PreviewGrid({ broadcasts, columns = 3 }: PreviewGridProps) {
  return (
    <div className={cn("grid aspect-video gap-3", GRID_COLS[columns])}>
      {broadcasts.map((b) => (
        <a
          key={`${b.bjId}-${b.broadNo}`}
          href={`/multiview?v=${encodeURIComponent(b.bjId)}`}
          className="group/cell ring-border/60 bg-muted relative overflow-hidden rounded-xl ring-1 transition-shadow hover:ring-primary/60"
        >
          {b.thumbnail ? (
            <Image
              src={b.thumbnail}
              alt={b.title}
              fill
              sizes="(max-width: 768px) 33vw, 256px"
              className="object-cover transition-transform duration-300 group-hover/cell:scale-105"
              unoptimized
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center">
              <Radio className="size-6" />
            </div>
          )}

          {/* LIVE 점 */}
          <span className="bg-destructive absolute top-1.5 left-1.5 size-1.5 animate-pulse rounded-full" />

          {/* 시청자 수 배지 */}
          <span className="tabular-nums absolute right-1.5 bottom-1.5 inline-flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <Users className="size-2.5" />
            {formatViewerCount(b.viewerCount)}
          </span>
        </a>
      ))}
    </div>
  );
}
