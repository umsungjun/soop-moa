import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * /sitemap.xml — 검색엔진 색인 힌트.
 *
 * Google은 <lastmod>만 실제로 사용하고 <changefreq>·<priority>는 무시한다.
 * 의미 없는 값을 넣지 않고 lastmod만 노출한다.
 * 나열되는 페이지는 색인 가능한 정규(canonical) URL이어야 한다. /me는 noindex라 제외.
 */

// 빌드 시점에 한 번 평가 → 배포마다 고정, 요청마다 바뀌지 않음.
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  return [
    { url: `${base}/`, lastModified: BUILD_DATE },
    { url: `${base}/multiview`, lastModified: BUILD_DATE },
    { url: `${base}/live`, lastModified: BUILD_DATE },
  ];
}
