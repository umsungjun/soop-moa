import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireAuthor } from "@/app/api/community/_helpers";
import { softDeleteComment } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ postId: string; commentId: string }>;
}

/** DELETE /api/community/posts/[postId]/comments/[commentId] — 본인 댓글 soft delete. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { commentId } = await params;
    const author = await requireAuthor();
    if (author instanceof NextResponse) return author;
    await softDeleteComment(commentId, author.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
