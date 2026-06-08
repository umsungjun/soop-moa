import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session/helpers";
import { bjIdFromProfileImage } from "@/lib/soop/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  // 구버전 세션 보강: SOOP stationinfo가 user_id를 안 줘서 저장된 userId가 없으면
  // 프로필 URL에서 BJ id를 추출해 세션에 채워 넣는다(클라이언트 소유권 UI·쓰기 권한용).
  if (session.user && !session.user.userId) {
    const derived = bjIdFromProfileImage(session.user.profileImage);
    if (derived) {
      session.user.userId = derived;
      await session.save();
    }
  }

  return NextResponse.json(
    { authenticated: true, user: session.user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
