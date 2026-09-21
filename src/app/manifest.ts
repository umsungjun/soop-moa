import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    scope: "/",
    lang: "ko",
    dir: "ltr",
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    // 멀티뷰는 가로가 편하지만 모바일 세로 스택도 지원하므로 방향을 고정하지 않는다.
    orientation: "any",
    background_color: "#090B11",
    theme_color: "#090B11",
    categories: ["entertainment", "video"],
    // purpose: "maskable"은 안전 영역(중앙 80% 원) 여백이 확보된 별도 아이콘이 있을 때만 붙인다. 현재 PNG는 여백이 작아 잘릴 수 있어 생략.
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
