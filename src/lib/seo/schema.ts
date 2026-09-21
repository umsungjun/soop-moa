// schema.org JSON-LD 빌더 — 페이지별 구조화 데이터가 같은 @id·형태를 쓰도록 한곳에 모은다.
import { siteConfig } from "@/config/site";

/** 루트 레이아웃 JSON-LD 노드의 @id. 페이지별 스키마가 isPartOf/publisher로 참조한다. */
export const SCHEMA_IDS = {
  website: `${siteConfig.url}/#website`,
  app: `${siteConfig.url}/#app`,
  publisher: `${siteConfig.url}/#publisher`,
} as const;

/** BreadcrumbList — 홈부터 현재 페이지까지의 경로. 마지막 항목은 현재 페이지라 url을 생략할 수 있다. */
export function breadcrumbList(items: { name: string; url?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/**
 * FAQPage — 화면에 렌더되는 질문·답과 동일한 데이터를 넘겨야 한다(불일치는 스팸 신호).
 * Google은 2023년부터 FAQ 리치 결과를 정부·의료 사이트로 제한했으므로 스니펫 확장은 기대하지 않는다. 의미론적 마크업 목적이다.
 */
export function faqPage(items: readonly { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
