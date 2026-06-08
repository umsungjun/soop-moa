import type { Metadata } from "next";
import Link from "next/link";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostList from "@/domains/community/components/post-list";
import { listPosts } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "커뮤니티",
  description:
    "SOOP 모아 커뮤니티 — 자유롭게 글을 남기고 댓글로 소통하는 공간입니다.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "커뮤니티 | SOOP 모아",
    description: "자유롭게 글을 남기고 댓글로 소통하세요.",
    url: "/community",
  },
};

export default async function CommunityPage() {
  // 첫 페이지는 서버에서 미리 받아 SEO + 초기 렌더 깜빡임 제거.
  const initialFirstPage = await listPosts({ limit: 20 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight">커뮤니티</h1>
          <p className="text-muted-foreground text-sm">
            자유롭게 글을 남기고 댓글로 소통하세요.
          </p>
        </div>
        <Button
          size="lg"
          variant="brand"
          nativeButton={false}
          // hover 시 살짝 떠오르는 알약형 CTA.
          className="rounded-full px-5 font-semibold transition-all hover:-translate-y-0.5"
          render={<Link href="/community/write" />}
        >
          <SquarePen />
          글쓰기
        </Button>
      </div>
      <PostList initialFirstPage={initialFirstPage} />
    </div>
  );
}
