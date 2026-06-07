import { ArrowRight, LayoutGrid, Radio, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveCard } from "@/domains/live/components/live-card";
import type { LiveBroadcast } from "@/domains/live/types";
import { getBroadList } from "@/lib/soop/client";

// 인기 방송 목록을 60초 주기로 재생성(ISR)한다.
export const revalidate = 60;

const LIVE_COUNT = 9;

const STEPS = [
  {
    icon: Radio,
    title: "라이브 둘러보기",
    desc: "실시간 방송 목록에서 보고 싶은 방송을 찾으세요.",
  },
  {
    icon: LayoutGrid,
    title: "멀티뷰에 담기",
    desc: "클릭 한 번으로 최대 4개 방송을 한 화면에 동시에.",
  },
  {
    icon: Share2,
    title: "링크로 공유",
    desc: "지금 보고 있는 구성을 URL 하나로 친구에게 전달.",
  },
];

export default async function LandingPage() {
  // 서버 컴포넌트에서 server-only SOOP 클라이언트를 직접 호출. 실패 시 빈 배열.
  let live: LiveBroadcast[] = [];
  try {
    live = (await getBroadList({ orderType: "view_cnt" })).slice(0, LIVE_COUNT);
  } catch {
    live = [];
  }

  return (
    <div className="relative overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-120 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
        }}
      />

      {/* ── Hero: 서비스 소개 ── */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 pb-12 text-center sm:px-6">
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

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button
            size="lg"
            className="w-full gap-1.5 sm:w-auto"
            nativeButton={false}
            render={<a href="/multiview" />}
          >
            멀티뷰 시작하기
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-1.5 sm:w-auto"
            nativeButton={false}
            render={<a href="/live" />}
          >
            <Radio />
            라이브 둘러보기
          </Button>
        </div>
      </section>

      {/* ── 이용 방법 ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="bg-card ring-border relative overflow-hidden rounded-2xl p-6 ring-1"
            >
              {/* 큰 단계 번호 — 특색 있는 배경 장식 */}
              <span className="text-primary/15 pointer-events-none absolute top-2 right-4 text-6xl font-bold tabular-nums select-none">
                {i + 1}
              </span>
              <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 지금 인기 라이브 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <span className="bg-destructive inline-flex size-2 animate-pulse rounded-full" />
              지금 인기 라이브
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              시청자가 많은 실시간 방송이에요.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1"
            nativeButton={false}
            render={<a href="/live" />}
          >
            전체 보기
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {live.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((b) => (
              <LiveCard key={`${b.bjId}-${b.broadNo}`} broadcast={b} />
            ))}
          </div>
        ) : (
          <div className="border-border text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-20 text-center">
            <Radio className="size-10 opacity-50" />
            <p className="text-sm">지금은 표시할 라이브 방송이 없어요.</p>
          </div>
        )}
      </section>
    </div>
  );
}
