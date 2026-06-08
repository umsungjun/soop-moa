import { NextResponse } from "next/server";
import type { IronSession } from "iron-session";
import { getSession, isAuthenticated } from "@/lib/session/helpers";
import type { SessionData } from "@/lib/session/types";
import { bjIdFromProfileImage } from "@/lib/soop/profile";
import { SupabaseDataError } from "@/lib/supabase/errors";
import type { ProfileUpsert } from "@/lib/supabase/types";

/** SOOP 프로필 이미지를 설정하지 않은 계정 안내(추출 실패 시). */
export const NO_USER_ID_MESSAGE =
  "SOOP 계정을 식별할 수 없어 작성이 제한됩니다. SOOP 프로필 이미지를 설정한 뒤 다시 로그인해 주세요.";

/**
 * 세션에서 작성자 정보를 도출, 비로그인/식별 불가 시 null.
 * SOOP은 user_id를 응답에 주지 않으므로(공식 문서 확인), 프로필 URL에서 BJ id를 추출한다.
 */
const authorFromSession = (
  session: IronSession<SessionData>,
): ProfileUpsert | null => {
  if (!isAuthenticated(session) || !session.user) return null;
  const userId =
    session.user.userId ?? bjIdFromProfileImage(session.user.profileImage);
  if (!userId) return null;
  return {
    userId,
    nick: session.user.userNick,
    profileImage: session.user.profileImage || null,
  };
};

/** 비로그인/뷰어용(선택) — 작성자 정보 또는 null. */
export const getAuthor = async (): Promise<ProfileUpsert | null> =>
  authorFromSession(await getSession());

/**
 * 쓰기 라우트용 — 작성자 정보를 강제한다.
 * 비로그인 → 401, 로그인했지만 BJ id를 못 구함 → 403(명확한 안내).
 * 반환이 NextResponse면 그대로 응답하면 된다.
 */
export const requireAuthor = async (): Promise<
  ProfileUpsert | NextResponse
> => {
  const session = await getSession();
  if (!isAuthenticated(session) || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const author = authorFromSession(session);
  if (!author) {
    return NextResponse.json({ error: NO_USER_ID_MESSAGE }, { status: 403 });
  }
  return author;
};

/** SupabaseDataError는 status로, 그 외는 500으로 매핑한다. */
export const errorResponse = (err: unknown): NextResponse => {
  if (err instanceof SupabaseDataError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[community] unexpected error", err);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
};
