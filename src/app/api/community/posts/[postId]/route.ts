import { NextResponse, type NextRequest } from "next/server";
import {
  errorResponse,
  getAuthor,
  requireAuthor,
} from "@/app/api/community/_helpers";
import { getPost, softDeletePost } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

/** GET /api/community/posts/[postId] — 글 상세 (공개, 로그인 시 myReaction 포함). */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const author = await getAuthor();
    const post = await getPost(postId, author?.userId);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE /api/community/posts/[postId] — 본인 글 soft delete. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const author = await requireAuthor();
    if (author instanceof NextResponse) return author;
    await softDeletePost(postId, author.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
