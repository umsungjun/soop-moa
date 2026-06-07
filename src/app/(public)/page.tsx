import { ArrowRight, LayoutGrid, Radio, Share2, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { PreviewGrid } from "@/domains/live/components/preview-grid";
import type { LiveBroadcast } from "@/domains/live/types";
import { getBroadList } from "@/lib/soop/client";

// 미리보기 그리드 크기 — 한 변의 칸 수(3 → 3×3 = 9개). 한 곳에서 조정.
const PREVIEW_COLUMNS = 3 as const;
const PREVIEW_COUNT = PREVIEW_COLUMNS * PREVIEW_COLUMNS;

// 인기 방송 목록을 서버에서 60초 주기로 재생성(ISR)해 정적 랜딩 성격을 유지한다.
export const revalidate = 60;

/** API 실패/방송 부족 시 폴백 — 기존 펄스 애니메이션 플레이스홀더(2×2). */
function PlaceholderGrid() {
  return (
    <div className="grid aspect-video grid-cols-2 grid-rows-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="from-primary/15 to-brand-accent/10 ring-border/60 relative animate-pulse overflow-hidden rounded-xl bg-linear-to-br ring-1"
          style={{
            animationDelay: `${i * 0.4}s`,
            animationDuration: "3s",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <LogoMark className="size-10" />
          </div>
          <div className="bg-destructive absolute top-2 left-2 size-1.5 animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "최대 4분할 멀티뷰",
    desc: "마우스로 화면 크기를 자유롭게 조절하며 여러 방송을 동시에.",
  },
  {
    icon: Share2,
    title: "URL로 공유",
    desc: "지금 보고 있는 멀티뷰 구성을 링크 하나로 친구에게 전달.",
  },
  {
    icon: Radio,
    title: "라이브 바로 추가",
    desc: "실시간 방송 목록에서 클릭 한 번으로 패널에 추가.",
  },
];

export default async function LandingPage() {
  // 서버 컴포넌트에서 server-only SOOP 클라이언트를 직접 호출. 실패 시 빈 배열로 폴백.
  let topBroadcasts: LiveBroadcast[] = [];
  try {
    const list = await getBroadList({ orderType: "view_cnt" });
    topBroadcasts = list.slice(0, PREVIEW_COUNT);
  } catch {
    topBroadcasts = [];
  }

  return (
    <div className="relative overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
        }}
      />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6">
        <div className="border-border bg-card/60 text-muted-foreground mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="text-primary size-3.5" />
          SOOP 공식 임베드 플레이어 기반
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          한 화면에서 즐기는
          <br />
          <span className="text-primary">여러 개의 라이브</span>
        </h1>

        <p className="text-muted-foreground mt-5 max-w-xl text-base text-pretty sm:text-lg">
          보고 싶은 SOOP 방송을 골라 멀티뷰에 담으세요. 최대 4분할, 자유로운
          레이아웃, 그리고 URL 하나로 공유까지.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gap-1.5"
            nativeButton={false}
            render={<a href="/multiview" />}
          >
            멀티뷰 시작하기
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-1.5"
            nativeButton={false}
            render={<a href="/live" />}
          >
            <Radio />
            라이브 둘러보기
          </Button>
        </div>

        {/* signature 미리보기 — 인기 실시간 방송 3×3, 데이터 부족/실패 시 플레이스홀더 */}
        <div className="ring-border bg-card/40 relative mt-16 w-full max-w-3xl rounded-2xl p-3 ring-1 backdrop-blur">
          {topBroadcasts.length >= PREVIEW_COUNT ? (
            <PreviewGrid broadcasts={topBroadcasts} columns={PREVIEW_COLUMNS} />
          ) : (
            <PlaceholderGrid />
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-24 sm:grid-cols-3 sm:px-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-card ring-border rounded-2xl p-6 ring-1"
          >
            <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
