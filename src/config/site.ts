export const siteConfig = {
  name: "SOOP 모아",
  shortName: "SOOP 모아",
  // 타이틀은 SOOP 일반 키워드와 경쟁하지 않고 롱테일 키워드
  // ("SOOP 멀티뷰", "4분할", "동시 시청")를 앞세운다.
  title: "SOOP 멀티뷰·4분할 동시 시청 | SOOP 모아",
  description:
    "SOOP 라이브 방송을 한 화면에서 최대 4개까지 동시에 시청. 마우스로 자유롭게 크기 조절, URL 하나로 멀티뷰 공유. SOOP 멀티뷰·4분할 라이브를 위한 비공식 팬 메이드 도구.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://soopmoa.vercel.app",
  locale: "ko_KR",
  ogImageAlt: "SOOP 모아 — SOOP 라이브 4분할 멀티뷰",
  // 롱테일 키워드 세트: SOOP 브랜드 헤드 텀과 경쟁하지 않고
  // 구체적 의도("multiview", "4분할", "동시 시청")와 그 변형을 노린다.
  keywords: [
    "SOOP 멀티뷰",
    "SOOP 모아",
    "숲모아",
    "SOOP 4분할",
    "SOOP 동시 시청",
    "SOOP 라이브 멀티뷰",
    "SOOP 멀티뷰 사이트",
    "BJ 동시 시청",
    "afreecaTV multiview",
    "sooplive multiview",
    "soop multiview",
    "라이브 멀티뷰",
    "스트리밍 4분할",
    "멀티뷰 사이트",
    "multi stream Korea",
  ],
  author: "soopmoa",
  links: {
    soop: "https://www.sooplive.co.kr",
    github: "https://github.com/umsungjun",
    email: "umseongjun@naver.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
