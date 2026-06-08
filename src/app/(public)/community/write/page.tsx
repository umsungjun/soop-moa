import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ImageOff, SquarePen, UserRound } from "lucide-react";
import { LoginButton } from "@/domains/auth/components/login-button";
import PostForm from "@/domains/community/components/post-form";
import { getSession, isAuthenticated } from "@/lib/session/helpers";
import { bjIdFromProfileImage } from "@/lib/soop/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "글쓰기",
  robots: { index: false, follow: false },
};

export default async function CommunityWritePage() {
  const session = await getSession();
  // 비로그인 시 자동 리다이렉트 대신 안내 화면을 보여준다(SSO 자동 재로그인 방지).
  if (!isAuthenticated(session)) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <div className="from-primary/15 to-brand-accent/10 text-primary flex size-16 items-center justify-center rounded-2xl bg-linear-to-br">
          <UserRound className="size-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">
            로그인이 필요합니다
          </h1>
          <p className="text-muted-foreground text-sm">
            글을 작성하려면 SOOP 계정으로 로그인하세요.
          </p>
        </div>
        <LoginButton />
      </div>
    );
  }

  // SOOP은 user_id를 응답에 주지 않아 프로필 이미지 URL에서 BJ id를 추출한다.
  // 추출 실패(기본 이미지 등) 시 작성 폼 대신 안내를 보여준다(제출 후 403 막다른 길 방지).
  const userId =
    session.user?.userId ?? bjIdFromProfileImage(session.user?.profileImage);
  if (!userId) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-2xl">
          <ImageOff className="size-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">
            프로필 설정이 필요합니다
          </h1>
          <p className="text-muted-foreground text-sm">
            SOOP 계정을 식별할 수 없어 글을 작성할 수 없습니다. SOOP 프로필
            이미지를 설정한 뒤 다시 로그인해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/community"
        className="text-muted-foreground hover:text-foreground bg-card ring-foreground/10 hover:ring-foreground/20 mb-6 inline-flex items-center gap-1 rounded-full py-1.5 pr-3.5 pl-2.5 text-sm shadow-sm ring-1 transition-all"
      >
        <ChevronLeft className="size-4" />
        목록
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <div className="from-primary/15 to-brand-accent/10 text-primary flex size-11 items-center justify-center rounded-2xl bg-linear-to-br">
          <SquarePen className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">글쓰기</h1>
          <p className="text-muted-foreground text-sm">
            커뮤니티에 새 글을 남겨보세요.
          </p>
        </div>
      </div>
      <div className="ring-foreground/10 rounded-2xl bg-card p-6 shadow-sm ring-1 sm:p-7">
        <PostForm />
      </div>
    </div>
  );
}
