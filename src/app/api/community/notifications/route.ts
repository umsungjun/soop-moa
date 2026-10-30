import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, getAuthor } from "@/app/api/community/_helpers";
import { markNotificationsReadSchema } from "@/app/api/community/_schemas";
import {
  listNotifications,
  markNotificationsRead,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

/** GET /api/community/notifications — 내 알림 최근 20건 + 안 읽은 수 (로그인 필수). */
export async function GET() {
  try {
    const author = await getAuthor();
    if (!author) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await listNotifications(author.userId));
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/community/notifications — { ids }가 있으면 해당 알림만, 없으면 전부 읽음 처리. */
export async function PATCH(request: NextRequest) {
  try {
    const author = await getAuthor();
    if (!author) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const json = await request.json().catch(() => ({}));
    const parsed = markNotificationsReadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 },
      );
    }
    await markNotificationsRead(author.userId, parsed.data.ids);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
