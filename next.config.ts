import type { NextConfig } from "next";

const SOOP_FRAME_SRC =
  "https://*.sooplive.com https://*.sooplive.co.kr https://*.afreecatv.com";
const SOOP_IMG_SRC =
  "https://*.sooplive.com https://*.sooplive.co.kr https://*.afreecatv.com";
// Microsoft Clarity(세션 분석)가 태그 스크립트 로드·비콘 전송에 쓰는 출처.
const CLARITY_SRC = "https://*.clarity.ms";

// NOTE: script-src/style-src use 'unsafe-inline' for MVP compatibility with
// Next.js inline runtime. Harden later with a nonce-based CSP if needed.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${CLARITY_SRC}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${SOOP_IMG_SRC} ${CLARITY_SRC}`,
  `media-src 'self' blob: ${SOOP_FRAME_SRC}`,
  `font-src 'self' data:`,
  `frame-src 'self' ${SOOP_FRAME_SRC}`,
  `connect-src 'self' https://*.sooplive.com https://*.sooplive.co.kr ${CLARITY_SRC} https://c.bing.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `frame-ancestors 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.sooplive.com" },
      { protocol: "https", hostname: "**.sooplive.co.kr" },
      { protocol: "https", hostname: "**.afreecatv.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            // local-network-access: 크롬/엣지의 로컬 네트워크 접근 정책 대응.
            // SOOP 임베드 플레이어가 로컬 "고화질 스트리머" 헬퍼(loopback)에 연결할 수 있도록
            // self + play.sooplive.com 오리진에 한해 위임한다. (최종 허용은 사용자의 브라우저 권한 동의 필요.)
            key: "Permissions-Policy",
            value:
              'camera=(), microphone=(), geolocation=(), local-network-access=(self "https://play.sooplive.com")',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
