import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const QUADS = ["#00E08F", "#12C98A", "#1FB389", "#2A9E8A"];

export default function Icon() {
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
          padding: 4,
        }}
      >
        {QUADS.map((c) => (
          <div
            key={c}
            style={{
              width: 11,
              height: 11,
              borderRadius: 3,
              background: c,
            }}
          />
        ))}
      </div>
    ),
    size,
  );
}
