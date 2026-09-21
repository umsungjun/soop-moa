import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Clarity } from "@/components/analytics/clarity";
import { DevAnnotations } from "@/components/dev/dev-annotations";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/lib/seo/json-ld";
import { SCHEMA_IDS } from "@/lib/seo/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "entertainment",
  // 전화/이메일/주소 자동 링크 비활성화 — 본문에 해당 정보가 없고, UA 스캔 방지.
  formatDetection: { telephone: false, address: false, email: false },
  // canonical은 루트에 두지 않는다. 최상위 키 단위로 얕게 병합되어 alternates를 선언하지 않은 모든 페이지(noindex인 /me·/community/write 포함)가 "/"를 canonical로 상속하기 때문이다.
  // 색인 대상 페이지는 각자 alternates.canonical을 선언한다.
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    // src/app의 opengraph-image.png는 자동 감지되지만, alt 텍스트와 함께
    // 명시하면 소셜 미리보기 품질이 좋아진다.
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.ogImageAlt,
      },
    ],
  },
  // 카드 타입만 지정한다. title·description·images를 여기서 고정하면 모든 하위 페이지가 사이트 공통 제목을 twitter:title로 내보내므로, Next의 페이지별 자동 채움(openGraph → twitter)에 맡긴다.
  twitter: {
    card: "summary_large_image",
  },
  // 세분화된 크롤러 지시문 — Google이 더 풍부한 스니펫을 노출하도록 허용.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // 사이트 소유 확인 — 각 웹마스터 콘솔에 등록할 때 env로 값을 채운다.
  // 빈 값은 Next가 자동으로 건너뛴다.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": [
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? "",
      ].filter(Boolean),
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFBFD" },
    { media: "(prefers-color-scheme: dark)", color: "#090B11" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

/** 구조화 데이터 — 검색엔진이 이 사이트를 조직/문서가 아니라 웹 앱으로
 * 인식하도록 돕는다. WebApplication + WebSite를 함께 선언. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SCHEMA_IDS.website,
      url: siteConfig.url,
      name: siteConfig.name,
      // 브랜드 검색어 변형("숲모아")을 같은 엔티티로 묶는다.
      alternateName: ["숲 모아", "숲모아", "soopmoa"],
      description: siteConfig.description,
      inLanguage: "ko-KR",
      publisher: { "@id": SCHEMA_IDS.publisher },
    },
    {
      "@type": "WebApplication",
      "@id": SCHEMA_IDS.app,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      inLanguage: "ko-KR",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
    },
    {
      "@type": "Organization",
      "@id": SCHEMA_IDS.publisher,
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-center" />
          </QueryProvider>
        </ThemeProvider>
        {/* 개발 환경에서만 렌더 */}
        {process.env.NODE_ENV !== "production" && <DevAnnotations />}
        <Clarity />
        <JsonLd data={jsonLd} />
      </body>
    </html>
  );
}
