import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { siteConfig } from "@/config/site";

// Search Console 데이터상 사용자는 "SOOP"보다 "숲"으로 훨씬 많이 검색하므로 "숲(SOOP)"을 병기한다.
// 이미 2위권에 드는 "4개/4분할" 각도를 타이틀 앞쪽에 유지한다.
export const metadata: Metadata = {
  title: "숲(SOOP) 멀티뷰 4분할 · 라이브 4개 동시 시청",
  description:
    "숲(SOOP) 라이브 최대 4개를 한 화면에서 동시 시청. 로그인 없이 무료, 마우스로 분할 크기 조절, 모바일은 세로 스택으로 시청, URL 한 줄로 멀티뷰 구성 공유.",
  keywords: [
    "숲 멀티뷰",
    "숲 멀티뷰 4개",
    "SOOP 멀티뷰",
    "숲 4분할",
    "SOOP 4분할",
    "숲 동시 시청",
    "숲 모바일 멀티뷰",
    "BJ 동시 시청",
  ],
  // ?v=…&o=… 공유 URL 변형은 모두 이 canonical로 통합된다.
  alternates: { canonical: "/multiview" },
  // 페이지 openGraph는 루트를 통째로 덮어쓰므로 type·siteName·locale을 다시 명시한다. title·description은 위 값을 자동 상속한다.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/multiview",
  },
};

export default function MultiviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      {/* 페이지 본문(MultiviewView)은 하이드레이션 전까지 "불러오는 중…"만 출력해 초기 HTML에 제목이 없다. 앱 셸에는 보이는 제목을 둘 자리가 없어 스크린리더·크롤러용 제목만 둔다. */}
      {/* 페이지 목적을 그대로 설명하는 텍스트라 검색엔진의 숨김 텍스트 정책에 저촉되지 않는다. 포커스 가능한 링크는 넣지 않는다(보이지 않는 요소로 포커스가 가면 접근성 문제). */}
      <h1 className="sr-only">
        숲(SOOP) 멀티뷰 — 라이브 방송 최대 4개 동시 시청
      </h1>
      <p className="sr-only">
        보고 싶은 SOOP 방송을 최대 4개까지 골라 한 화면에서 동시에 시청합니다.
        로그인 없이 무료로 이용할 수 있고, PC에서는 마우스로 분할 크기를
        조절하며 모바일에서는 세로로 쌓아 봅니다.
      </p>
      {children}
    </div>
  );
}
