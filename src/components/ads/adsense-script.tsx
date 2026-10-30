import { ADSENSE_CLIENT_ID, ADSENSE_ENABLED } from "./config";

// next/script는 data-nscript 속성을 붙여 AdSense가 경고를 낸다. React 19는 async script를 head로 올리고 중복을 제거하므로 일반 태그로 둔다.
// 멀티뷰에는 넣지 않는다. 자동 광고(앵커·전면)가 플레이어를 가리기 때문이다.
export default function AdSenseScript() {
  if (!ADSENSE_ENABLED) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
