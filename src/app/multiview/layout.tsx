import type { Metadata } from "next";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "SOOP 멀티뷰 · 4분할 동시 시청",
  description:
    "SOOP 라이브 방송을 한 화면에서 최대 4개까지 동시 시청. 마우스로 자유롭게 분할 크기 조절, URL 한 줄로 멀티뷰 구성 공유. SOOP 4분할 멀티뷰 도구.",
  keywords: [
    "SOOP 멀티뷰",
    "SOOP 4분할",
    "SOOP 동시 시청",
    "SOOP 라이브 멀티뷰",
    "BJ 동시 시청",
    "4분할 라이브",
  ],
  alternates: { canonical: "/multiview" },
  openGraph: {
    title: "SOOP 멀티뷰 · 4분할 동시 시청 | SOOP 모아",
    description:
      "SOOP 라이브를 최대 4개까지 한 화면에서. 자유 분할 + URL 공유.",
    url: "/multiview",
  },
};

export default function MultiviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      {children}
    </div>
  );
}
