import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const QUADS = ["#00E08F", "#12C98A", "#1FB389", "#2A9E8A"];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignContent: "space-between",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#0A0A0B",
          padding: 24,
        }}
      >
        {QUADS.map((c) => (
          <div
            key={c}
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: c,
            }}
          />
        ))}
      </div>
    ),
    size,
  );
}
