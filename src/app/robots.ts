import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * /robots.txt — 크롤러 지시문.
 *
 * 이 파일의 역할은 주로 (a) Sitemap 위치 안내, (b) 색인할 내용이 없는
 * 경로(/api/)나 개인정보가 있는 경로(/me)로 크롤러가 들어가지 않게 막는 것이다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/live", "/multiview"],
        disallow: [
          "/api/", // 서버 엔드포인트 — 색인 대상 아님
          "/me", // 개인 프로필 — 페이지도 noindex, 여기서 한 번 더 차단
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
