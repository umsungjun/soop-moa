import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listPostsForSitemap } from "@/lib/supabase/queries";

/**
 * /sitemap.xml — 검색엔진 색인 힌트.
 *
 * Google은 <lastmod>만 실제로 사용하고 <changefreq>·<priority>는 무시한다.
 * 의미 없는 값을 넣지 않고 lastmod만 노출한다.
 * 나열되는 페이지는 색인 가능한 정규(canonical) URL이어야 한다. /me·/community/write는 noindex라 제외.
 */

// 새 글이 redeploy 없이도 색인되도록 1시간마다 재생성한다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/multiview`, lastModified: now },
    { url: `${base}/live`, lastModified: now },
    { url: `${base}/community`, lastModified: now },
  ];

  // 커뮤니티 글 상세 — DB 조회가 실패해도 사이트맵/빌드를 깨지 않도록 정적 경로만 폴백.
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPostsForSitemap();
    postRoutes = posts.map((p) => ({
      url: `${base}/community/${p.id}`,
      lastModified: p.updatedAt,
    }));
  } catch {
    // ignore — 글 목록은 부가 정보라 실패해도 무시
  }

  return [...staticRoutes, ...postRoutes];
}
