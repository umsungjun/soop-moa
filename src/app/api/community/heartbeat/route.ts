import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/app/api/community/_helpers";
import { getServerEnv } from "@/lib/env";
import { pingDatabase } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/community/heartbeat — Supabase 무료 티어 7일 자동 일시정지 회피용.
 * Vercel Cron이 `Authorization: Bearer $CRON_SECRET`로 호출한다.
 * CRON_SECRET 미설정 시 항상 401(공개 스팸 방지).
 */
export async function GET(request: NextRequest) {
  const { CRON_SECRET } = getServerEnv();
  const auth = request.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await pingDatabase();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
