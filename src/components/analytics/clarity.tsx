import Script from "next/script";

// Microsoft Clarity — 세션 리플레이·히트맵 분석.
// 운영(프로덕션·프리뷰)에서만 로드해 로컬 dev 세션이 데이터를 오염시키지 않게 한다.
// 외부 출처(*.clarity.ms, c.bing.com)는 next.config.ts의 CSP에 화이트리스트되어 있어야 동작한다.
const CLARITY_PROJECT_ID = "x3syxbhmz8";

export function Clarity() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
    </Script>
  );
}
