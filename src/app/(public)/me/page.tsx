import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Heart, Radio, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/domains/auth/components/login-button";
import { LogoutButton } from "@/domains/me/components/logout-button";
import {
  getSession,
  getValidAccessToken,
  isAuthenticated,
} from "@/lib/session/helpers";
import { getBroadList, getStationInfo } from "@/lib/soop/client";
import { SOOP_STATION_BASE } from "@/lib/soop/endpoints";
import { formatRelativeTime } from "@/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 프로필",
  robots: { index: false, follow: false },
};

export default async function MePage() {
  const session = await getSession();
  // 비로그인 상태에서는 자동으로 로그인 플로우를 태우지 않는다.
  // (SOOP SSO가 살아 있으면 무프롬프트 재로그인이 일어나 "로그아웃 의도"를 무시하게 됨)
  // 대신 명시적으로 로그인할 수 있는 안내 화면을 보여준다.
  if (!isAuthenticated(session)) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
          <UserRound className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">
            로그인이 필요합니다
          </h1>
          <p className="text-muted-foreground text-sm">
            내 프로필을 보려면 SOOP 계정으로 로그인하세요.
          </p>
        </div>
        <LoginButton />
      </div>
    );
  }

  const user = session.user!;
  let favoriteCount: number | undefined;
  let latelyBroad: string | undefined;
  let userId = user.userId;
  try {
    const token = await getValidAccessToken(session);
    const info = await getStationInfo(token);
    favoriteCount = info.favorite_cnt;
    latelyBroad = info.lately_broad_date;
    userId ??= info.user_id; // 이 필드 도입 이전 세션 백필
  } catch {
    // fall back to cached session info
  }

  // 현재 라이브 여부(best-effort): 인기 방송 목록에 본인이 있으면 방송 중으로 표시한다.
  // 목록에 없을 때는 "오프라인"으로 단정하지 않고 배지를 숨긴다(상위 페이지 미등장 = false negative 가능).
  let isLive = false;
  if (userId) {
    try {
      const list = await getBroadList({ orderType: "view_cnt" });
      isLive = list.some((b) => b.bjId === userId);
    } catch {
      // ignore — 라이브 여부는 부가 정보라 실패해도 무시
    }
  }

  const channelUrl = userId
    ? `${SOOP_STATION_BASE}/${encodeURIComponent(userId)}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="bg-card ring-border overflow-hidden rounded-2xl ring-1">
        <div className="from-primary/20 to-brand-accent/10 h-28 bg-linear-to-r" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="ring-card bg-muted relative -mt-12 size-24 shrink-0 overflow-hidden rounded-2xl ring-4">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.userNick}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {user.userNick}
              </h1>
              {isLive ? (
                <span className="bg-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground text-sm">{user.stationName}</p>
            {userId ? (
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                @{userId}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {channelUrl ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={channelUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                }
              >
                <ExternalLink />
                SOOP 채널
              </Button>
            ) : null}
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="bg-card ring-border flex items-center gap-3 rounded-xl p-4 ring-1">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
            <Heart className="size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">즐겨찾기 수</p>
            <p className="tabular-nums text-lg font-semibold">
              {favoriteCount?.toLocaleString("ko-KR") ?? "—"}
            </p>
          </div>
        </div>
        <div className="bg-card ring-border flex items-center gap-3 rounded-xl p-4 ring-1">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
            <Radio className="size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">최근 방송</p>
            <p className="text-lg font-semibold">
              {formatRelativeTime(latelyBroad) || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
