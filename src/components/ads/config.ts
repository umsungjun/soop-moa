// Google AdSense 설정. 클라이언트 ID가 없으면 스크립트·광고 칸·ads.txt를 모두 내보내지 않는다.
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID; // ca-pub-XXXXXXXXXXXXXXXX
export const ADSENSE_SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

// 로컬 dev 노출이 무효 트래픽으로 잡히지 않도록 운영 빌드에서만 켠다.
export const ADSENSE_ENABLED =
  process.env.NODE_ENV === "production" && Boolean(ADSENSE_CLIENT_ID);
