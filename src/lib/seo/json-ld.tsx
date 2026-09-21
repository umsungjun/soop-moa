/**
 * JSON-LD(구조화 데이터)를 인라인하는 서버 컴포넌트.
 *
 * `JSON.stringify`는 XSS를 막아주지 않으므로 `<`를 유니코드 이스케이프로 치환한다.
 * 이렇게 하면 사용자 입력(커뮤니티 글 제목·본문 등)이 섞여도 `</script>`로 스크립트를 이탈할 수 없다.
 * JSON-LD는 실행 코드가 아닌 데이터라 next/script 대신 네이티브 <script>를 쓴다(Next 공식 권장).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
