import type { Metadata } from "next";
import {
  ArrowRight,
  Info,
  Keyboard,
  Link2,
  MessagesSquare,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { FaqList } from "@/domains/guide/components/faq-list";
import {
  GUIDE_FAQ,
  GUIDE_SHORTCUTS,
  GUIDE_STEPS,
} from "@/domains/guide/content";
import {
  HD_ACCESS_NOTICE_URL,
  MAX_PANELS,
  MIN_PANEL_SIZE,
} from "@/domains/multiview/constants";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbList, faqPage } from "@/lib/seo/schema";

// "숲 멀티뷰 하는법", "숲 모바일 멀티뷰" 같은 정보형 검색을 받아주는 정적 페이지.
// 서술은 실제 멀티뷰 구현과 일치해야 하며, 데이터(src/domains/guide/content.ts)는 화면과 FAQPage JSON-LD가 공유한다.
export const metadata: Metadata = {
  title: "숲(SOOP) 멀티뷰 하는법 · PC·모바일 가이드",
  description:
    "숲(SOOP) 멀티뷰 사용법을 3단계로 정리했습니다. PC 4분할 크기 조절, 모바일 세로 스택 시청, URL 공유, 고화질(HD) 시청 문제 해결, 자주 묻는 질문까지.",
  keywords: [
    "숲 멀티뷰 하는법",
    "숲 모바일 멀티뷰",
    "SOOP 멀티뷰 사용법",
    "숲 멀티뷰 4개",
    "숲 4분할 방법",
  ],
  alternates: { canonical: "/guide" },
  // 페이지 openGraph는 루트를 통째로 덮어쓰므로 type·siteName·locale을 다시 명시한다. title·description은 위 값을 자동 상속한다.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/guide",
  },
};

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:text-2xl">
      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </span>
      {children}
    </h2>
  );
}

export default function GuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      faqPage(GUIDE_FAQ),
      breadcrumbList([
        { name: "홈", url: `${siteConfig.url}/` },
        { name: "사용 가이드", url: `${siteConfig.url}/guide` },
      ]),
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />

      {/* ── 제목 ── */}
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          숲(SOOP) 멀티뷰 하는법
        </h1>
        <p className="text-muted-foreground text-pretty">
          PC와 모바일에서 SOOP 라이브를 최대 {MAX_PANELS}개까지 한 화면에 보는
          방법을 정리했어요. 로그인 없이 바로 쓸 수 있습니다.
        </p>
      </div>

      <div className="space-y-12">
        {/* ── 3단계 ── */}
        <section aria-labelledby="guide-steps">
          <SectionTitle icon={Monitor}>
            <span id="guide-steps">3단계로 시작하기</span>
          </SectionTitle>
          <ol className="mt-5 grid gap-3">
            {GUIDE_STEPS.map((s, i) => (
              <li
                key={s.title}
                className="bg-card ring-border relative overflow-hidden rounded-2xl p-5 ring-1"
              >
                <span className="text-primary/15 pointer-events-none absolute top-1 right-4 text-5xl font-bold tabular-nums select-none">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── PC ── */}
        <section aria-labelledby="guide-pc">
          <SectionTitle icon={Keyboard}>
            <span id="guide-pc">PC에서 4분할 보기</span>
          </SectionTitle>
          <ul className="text-muted-foreground mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              패널은 개수에 따라 자동 배치됩니다. 1개는 전체 화면, 2개는 좌우
              분할, 3개는 위 2개·아래 1개, 4개는 2×2 4분할이에요.
            </li>
            <li>
              패널 사이 경계선을 드래그하면 비율이 바뀝니다. 각 칸은 최소{" "}
              {MIN_PANEL_SIZE}%까지 줄일 수 있고, 툴바의 &ldquo;레이아웃
              초기화&rdquo;로 기본 비율로 되돌립니다. 패널 수가 바뀌면 비율은
              자동으로 초기화됩니다.
            </li>
            <li>
              패널에 마우스를 올리면 상단 중앙에 컨트롤이 나타납니다. 채팅
              보기/숨기기, 새로고침, 패널 닫기, 컨트롤 접기를 할 수 있어요.
            </li>
            <li>
              소리는 각 SOOP 플레이어의 볼륨 버튼으로 조절합니다. 듣고 싶은
              방송만 켜 두세요.
            </li>
          </ul>
          <div className="bg-card ring-border mt-4 overflow-hidden rounded-2xl ring-1">
            <table className="w-full text-sm">
              <caption className="text-muted-foreground px-5 pt-4 pb-2 text-left text-xs font-medium">
                키보드 단축키 (입력창에 타이핑 중일 때는 동작하지 않아요)
              </caption>
              <tbody>
                {GUIDE_SHORTCUTS.map((s) => (
                  <tr key={s.keys} className="border-border/60 border-t">
                    <th
                      scope="row"
                      className="w-44 px-5 py-2.5 text-left font-mono text-xs font-medium"
                    >
                      {s.keys}
                    </th>
                    <td className="text-muted-foreground px-5 py-2.5">
                      {s.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 모바일 ── */}
        <section aria-labelledby="guide-mobile">
          <SectionTitle icon={Smartphone}>
            <span id="guide-mobile">모바일에서 멀티뷰 보기</span>
          </SectionTitle>
          <p className="text-muted-foreground mt-5 text-sm leading-relaxed text-pretty">
            화면이 좁은 모바일에서는 분할 그리드 대신 방송이 16:9 크기로 세로로
            쌓이고, 스크롤하며 봅니다. 하단의 &ldquo;방송 추가&rdquo; 버튼으로
            최대 {MAX_PANELS}개까지 추가할 수 있고 컨트롤은 항상 표시됩니다.
            PC에서 만든 공유 링크를 모바일에서 열어도 같은 구성이 복원됩니다.
            브라우저의 자동재생 정책에 따라 소리는 각 플레이어에서 직접 켜야 할
            수 있어요.
          </p>
        </section>

        {/* ── 공유 ── */}
        <section aria-labelledby="guide-share">
          <SectionTitle icon={Link2}>
            <span id="guide-share">멀티뷰 URL 공유</span>
          </SectionTitle>
          <p className="text-muted-foreground mt-5 text-sm leading-relaxed text-pretty">
            툴바의 &ldquo;공유&rdquo;를 누르면 현재 주소가 복사됩니다. 주소의{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              v=
            </code>{" "}
            에 방송 순서(빈 칸은 <code className="font-mono">_</code>),{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              o=
            </code>{" "}
            에 채팅 표시 여부가 담겨 링크를 연 사람도 같은 구성을 봅니다. 구성은
            브라우저에도 자동 저장되어 새로고침하거나 다음에 방문해도
            복원됩니다.
          </p>
        </section>

        {/* ── HD ── */}
        <section aria-labelledby="guide-hd" id="hd">
          <SectionTitle icon={Info}>
            <span id="guide-hd">고화질(HD) 시청이 안 될 때</span>
          </SectionTitle>
          <p className="text-muted-foreground mt-5 text-sm leading-relaxed text-pretty">
            크롬·엣지의 로컬 네트워크 접근 정책 변경으로 고화질 재생이 막힐 수
            있습니다. 브라우저의 사이트 권한에서{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              play.sooplive.com
            </code>
            의 &ldquo;기기에 있는 앱(로컬 네트워크)&rdquo; 권한을 허용해 주세요.{" "}
            <a
              href={HD_ACCESS_NOTICE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline underline-offset-4"
            >
              SOOP 공지에서 해결 방법 보기
            </a>
          </p>
        </section>

        {/* ── FAQ ── */}
        <section aria-labelledby="guide-faq">
          <SectionTitle icon={MessagesSquare}>
            <span id="guide-faq">자주 묻는 질문</span>
          </SectionTitle>
          <div className="mt-5">
            <FaqList items={GUIDE_FAQ} />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-card ring-border flex flex-col items-center gap-4 rounded-2xl p-8 text-center ring-1">
          <h2 className="text-xl font-bold tracking-tight">
            바로 시작해 볼까요?
          </h2>
          <p className="text-muted-foreground text-sm text-pretty">
            설치도, 로그인도 필요 없어요. 보고 싶은 방송을 골라 담기만 하면
            됩니다.
          </p>
          <Button
            size="lg"
            className="gap-1.5"
            nativeButton={false}
            render={<a href="/multiview" />}
          >
            멀티뷰 시작하기
            <ArrowRight />
          </Button>
        </section>
      </div>
    </div>
  );
}
