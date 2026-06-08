import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireAuthor } from "@/app/api/community/_helpers";
import { reactionSchema } from "@/app/api/community/_schemas";
import { getMyReaction, setReaction } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

/** GET /api/community/posts/[postId]/reaction — 내 반응 조회 (로그인 필수). */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const author = await requireAuthor();
    if (author instanceof NextResponse) return author;
    const myReaction = await getMyReaction(postId, author.userId);
    return NextResponse.json({ myReaction });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/community/posts/[postId]/reaction — 좋아요/싫어요 토글 (로그인 필수). */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const author = await requireAuthor();
    if (author instanceof NextResponse) return author;
    const json = await request.json().catch(() => null);
    const parsed = reactionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const result = await setReaction({
      postId,
      user: author,
      value: parsed.data.value,
    });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
