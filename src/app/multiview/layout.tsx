import type { Metadata } from "next";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "멀티뷰",
  description:
    "여러 SOOP 라이브 방송을 한 화면에서 동시에. 최대 4분할, 자유로운 크기 조절, URL 공유.",
};

export default function MultiviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <Header />
      {children}
    </div>
  );
}
