import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireAuthor } from "@/app/api/community/_helpers";
import {
  createPostSchema,
  listQuerySchema,
} from "@/app/api/community/_schemas";
import { createPost, listPosts } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

/** GET /api/community/posts — 글 목록 (keyset 페이지네이션, 공개). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = listQuerySchema.safeParse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    const page = await listPosts(parsed.data);
    return NextResponse.json(page);
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/community/posts — 글 작성 (로그인 필수). */
export async function POST(request: NextRequest) {
  try {
    const author = await requireAuthor();
    if (author instanceof NextResponse) return author;
    const json = await request.json().catch(() => null);
    const parsed = createPostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 },
      );
    }
    const post = await createPost({ author, ...parsed.data });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
