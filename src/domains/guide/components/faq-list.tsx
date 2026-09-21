import type { GuideFaq } from "@/domains/guide/content";

/** 질문·답을 모두 펼친 상태로 렌더한다. 접힘 UI 없이 전부 HTML에 노출해 크롤러와 스크린리더가 FAQPage JSON-LD와 같은 내용을 읽는다. */
export function FaqList({ items }: { items: readonly GuideFaq[] }) {
  return (
    <div className="grid gap-3">
      {items.map((f) => (
        <div key={f.q} className="bg-card ring-border rounded-2xl p-5 ring-1">
          <h3 className="font-semibold text-pretty">{f.q}</h3>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
            {f.a}
          </p>
        </div>
      ))}
    </div>
  );
}
