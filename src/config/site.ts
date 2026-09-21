export const siteConfig = {
  name: "SOOP 모아",
  shortName: "SOOP 모아",
  // Search Console 데이터상 사용자는 "SOOP"보다 "숲"으로 훨씬 많이 검색하므로 "숲(SOOP)"을 병기한다.
  // 이미 2위권에 드는 "4개" 각도와 롱테일("동시 시청")을 앞세우고 SOOP 브랜드 헤드 텀과는 경쟁하지 않는다.
  // 페이지별 역할 분담: / = 브랜드·헤드 키워드, /multiview = "4개/4분할", /guide = "하는법/모바일".
  title: "숲(SOOP) 멀티뷰 · 라이브 4개 동시 시청 | SOOP 모아",
  description:
    "숲(SOOP) 라이브 방송을 한 화면에서 최대 4개까지 동시 시청하는 무료 멀티뷰. 로그인 없이 바로 시작, 마우스로 4분할 크기 조절, 모바일 지원, URL 하나로 멀티뷰 공유. SOOP 공식 임베드 플레이어 기반 팬 메이드 도구.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://soopmoa.vercel.app",
  locale: "ko_KR",
  ogImageAlt: "SOOP 모아 — 숲(SOOP) 라이브 4분할 멀티뷰",
  // 실제 유입 검색어("숲 멀티뷰", "숲 멀티뷰 4개", "숲 멀티뷰 하는법", "숲 모바일 멀티뷰", "soop 멀티뷰")를 앞에 둔다.
  // Google은 meta keywords를 무시하지만 네이버 등 국내 검색엔진 대응으로 유지한다.
  keywords: [
    "숲 멀티뷰",
    "숲 멀티뷰 4개",
    "숲 멀티뷰 하는법",
    "숲 모바일 멀티뷰",
    "숲 멀티뷰 사이트",
    "숲 4분할",
    "숲 동시 시청",
    "SOOP 멀티뷰",
    "soop 멀티뷰",
    "SOOP 4분할",
    "SOOP 동시 시청",
    "SOOP 모아",
    "숲모아",
    "BJ 동시 시청",
    "라이브 멀티뷰",
    "멀티뷰 사이트",
    "sooplive multiview",
    "afreecatv multiview",
  ],
  author: "soopmoa",
  links: {
    soop: "https://www.sooplive.co.kr",
    github: "https://github.com/umsungjun",
    email: "umseongjun@naver.com",
  },
} as const;
