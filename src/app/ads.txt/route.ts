import { ADSENSE_CLIENT_ID } from "@/components/ads/config";

// AdSense 판매자 인증. 값이 빌드 시 인라인되므로 정적으로 내보낸다.
export const dynamic = "force-static";

export function GET() {
  if (!ADSENSE_CLIENT_ID) return new Response("Not Found", { status: 404 });
  const publisherId = ADSENSE_CLIENT_ID.replace(/^ca-/, "");
  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
