import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { GUIDE_UPDATED_AT } from "@/domains/guide/content";
import { listPostsForSitemap } from "@/lib/supabase/queries";

/**
 * /sitemap.xml — 검색엔진 색인 힌트.
 *
 * Google은 <lastmod>만 실제로 사용하고 <changefreq>·<priority>는 무시한다.
 * lastmod는 "마지막으로 의미 있게 바뀐 시각"을 알 때만 넣는다. 매 재생성마다 now()를 넣으면 신호가 무의미해져 Google이 lastmod 자체를 불신하게 되므로, 모르는 페이지는 생략한다.
 * 나열되는 페이지는 색인 가능한 정규(canonical) URL이어야 한다. /me·/community/write는 noindex라 제외.
 */

// 새 글이 redeploy 없이도 색인되도록 1시간마다 재생성한다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  // 커뮤니티 글 — DB 조회가 실패해도 사이트맵/빌드를 깨지 않도록 정적 경로만 폴백.
  let posts: Awaited<ReturnType<typeof listPostsForSitemap>> = [];
  try {
    posts = await listPostsForSitemap();
  } catch {
    // ignore — 글 목록은 부가 정보라 실패해도 무시
  }

  // 목록 페이지의 lastmod는 가장 최근에 바뀐 글 시각. 글이 없으면 생략.
  // posts.updated_at은 좋아요·댓글 카운터 트리거로도 갱신되므로 "목록에 변화가 있었다"는 신호로는 적절하다.
  const latestPostAt = posts.reduce<Date | undefined>(
    (acc, p) =>
      !acc || p.updatedAt.getTime() > acc.getTime() ? p.updatedAt : acc,
    undefined,
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/` },
    { url: `${base}/multiview` },
    // 가이드는 본문을 고칠 때 content.ts의 날짜를 함께 갱신한다.
    { url: `${base}/guide`, lastModified: GUIDE_UPDATED_AT },
    { url: `${base}/live` },
    { url: `${base}/community`, lastModified: latestPostAt },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/community/${p.id}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...postRoutes];
}
