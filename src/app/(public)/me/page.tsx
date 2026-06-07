import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Heart, Radio } from "lucide-react";
import {
  getSession,
  getValidAccessToken,
  isAuthenticated,
} from "@/lib/session/helpers";
import { getStationInfo } from "@/lib/soop/client";
import { formatRelativeTime } from "@/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 프로필",
  robots: { index: false, follow: false },
};

export default async function MePage() {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    redirect("/api/auth/login");
  }

  let favoriteCount: number | undefined;
  let latelyBroad: string | undefined;
  try {
    const token = await getValidAccessToken(session);
    const info = await getStationInfo(token);
    favoriteCount = info.favorite_cnt;
    latelyBroad = info.lately_broad_date;
  } catch {
    // fall back to cached session info
  }

  const user = session.user!;

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
            <h1 className="text-2xl font-bold tracking-tight">
              {user.userNick}
            </h1>
            <p className="text-muted-foreground text-sm">{user.stationName}</p>
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
