import AdSenseScript from "@/components/ads/adsense-script";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 광고는 콘텐츠 페이지에만. /multiview 레이아웃에는 싣지 않는다. */}
      <AdSenseScript />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
