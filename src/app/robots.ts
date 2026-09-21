import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * /robots.txt — 크롤러 지시문.
 *
 * 역할은 (a) Sitemap 위치 안내, (b) 색인할 내용이 없는 서버 엔드포인트(/api/) 차단이다.
 * /me·/community/write는 여기서 막지 않는다. robots로 막힌 URL은 크롤러가 내려받지 못해 페이지의 noindex 메타를 볼 수 없고, 다른 페이지의 링크만 보고 "URL만 있는" 색인이 남을 수 있다.
 * 두 페이지는 metadata.robots의 noindex로 제외한다(익명 요청에는 로그인 안내만 렌더되어 개인정보 노출도 없다).
 * host 지시문은 표준이 아니라(Yandex 전용) 두지 않는다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 서버 엔드포인트 — 색인 대상이 아니고, OAuth 진입점(/api/auth/login)을 크롤러가 밟지 않게 한다.
      disallow: "/api/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
