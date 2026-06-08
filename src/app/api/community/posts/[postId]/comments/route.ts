import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireAuthor } from "@/app/api/community/_helpers";
import { createCommentSchema } from "@/app/api/community/_schemas";
import { createComment, listComments } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

/** GET /api/community/posts/[postId]/comments — 1단계 트리로 조립한 댓글 목록 (공개). */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const list = await listComments(postId);
    return NextResponse.json({ list });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/community/posts/[postId]/comments — 댓글/대댓글 작성 (로그인 필수). */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const author = await requireAuthor();
    if (author instanceof NextResponse) return author;
    const json = await request.json().catch(() => null);
    const parsed = createCommentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 },
      );
    }
    const comment = await createComment({
      postId,
      author,
      body: parsed.data.body,
      parentId: parsed.data.parentId ?? null,
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
