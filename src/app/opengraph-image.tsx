import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.name;

const QUADS = ["#00E08F", "#12C98A", "#1FB389", "#2A9E8A"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0A0A0B",
          color: "#FAFAFA",
          padding: 80,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#00E08F",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            SOOP MOA
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.15,
              marginTop: 24,
            }}
          >
            한 화면에서 즐기는 여러 개의 라이브
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#A1A1AA",
              marginTop: 24,
            }}
          >
            최대 4분할 멀티뷰 · 자유로운 레이아웃 · URL 공유
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignContent: "space-between",
            justifyContent: "space-between",
            width: 300,
            height: 300,
          }}
        >
          {QUADS.map((c) => (
            <div
              key={c}
              style={{
                width: 140,
                height: 140,
                borderRadius: 28,
                background: c,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
