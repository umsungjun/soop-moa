import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  MessagesSquare,
  Radio,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

// 404 응답에는 Next가 noindex 메타를 자동 삽입하지만, 루트의 robots(index, follow)가 함께 상속되어 상충하는 태그가 나오므로 여기서 덮어쓴다.
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/multiview", label: "멀티뷰", icon: LayoutGrid },
  { href: "/live", label: "라이브", icon: Radio },
  { href: "/community", label: "커뮤니티", icon: MessagesSquare },
  { href: "/guide", label: "사용 가이드", icon: BookOpen },
];

// 루트 not-found — (public) 레이아웃 바깥에서 렌더되므로 Header/Footer를 직접 감싼다.
// 글 상세의 notFound()도 가장 가까운 경계인 이 파일로 올라온다.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6">
        <div className="max-w-md text-center">
          <p className="text-primary text-sm font-semibold tabular-nums">404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-muted-foreground mt-3 text-sm text-pretty">
            주소가 바뀌었거나 삭제된 페이지예요. 아래에서 원하는 곳으로
            이동하세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button
              className="gap-1.5"
              nativeButton={false}
              render={<Link href="/" />}
            >
              홈으로
              <ArrowRight />
            </Button>
            {LINKS.map((l) => (
              <Button
                key={l.href}
                variant="outline"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href={l.href} />}
              >
                <l.icon />
                {l.label}
              </Button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
