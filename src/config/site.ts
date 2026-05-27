export const siteConfig = {
  name: "SOOP MOA",
  title: "SOOP MOA — 한 화면에서 여러 라이브 방송을",
  description:
    "SOOP 라이브 방송을 멀티뷰로 동시에 시청하세요. 최대 4분할 그리드, 마우스로 자유롭게 크기 조절, URL로 공유 가능.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://soopmoa.vercel.app",
  keywords: [
    "SOOP",
    "숲",
    "숲모아",
    "멀티뷰",
    "multiview",
    "라이브",
    "방송",
    "스트리밍",
    "streaming",
  ],
  links: {
    soop: "https://www.sooplive.co.kr",
  },
} as const;

export type SiteConfig = typeof siteConfig;
