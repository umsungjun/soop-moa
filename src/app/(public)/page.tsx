import { ArrowRight, LayoutGrid, Radio, Share2, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

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

export default function LandingPage() {
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

        {/* signature 2x2 preview */}
        <div className="ring-border bg-card/40 relative mt-16 w-full max-w-3xl rounded-2xl p-3 ring-1 backdrop-blur">
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
