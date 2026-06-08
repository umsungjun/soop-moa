import type { Metadata } from "next";
import { ImageOff, UserRound } from "lucide-react";
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
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
          <UserRound className="size-7" />
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
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
          <ImageOff className="size-7" />
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">글쓰기</h1>
      <PostForm />
    </div>
  );
}
