import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LiveBrowser } from "@/domains/live/components/live-browser";

export const metadata: Metadata = {
  title: "숲(SOOP) 라이브 방송 목록",
  description:
    "현재 방송 중인 숲(SOOP) 라이브를 카테고리·시청자 수별로 둘러보고 클릭 한 번으로 멀티뷰에 추가하세요. SOOP 실시간 방송 검색·발견 도구.",
  keywords: [
    "숲 라이브 목록",
    "SOOP 라이브 목록",
    "SOOP 실시간 방송",
    "SOOP 카테고리",
    "BJ 검색",
    "라이브 방송 둘러보기",
  ],
  alternates: { canonical: "/live" },
  // 페이지 openGraph는 루트를 통째로 덮어쓰므로 type·siteName·locale을 다시 명시한다. title·description은 위 값을 자동 상속한다.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/live",
  },
};

export default function LivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          숲(SOOP) 라이브 방송
        </h1>
        <p className="text-muted-foreground text-sm">
          방송을 선택하면 멀티뷰에 추가됩니다. 최대 4개까지 동시 시청할 수
          있어요.
        </p>
      </div>
      <LiveBrowser />
    </div>
  );
}
