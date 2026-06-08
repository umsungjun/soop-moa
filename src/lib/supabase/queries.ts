import "server-only";
import { getSupabaseAdmin } from "./client";
import { SupabaseDataError } from "./errors";
import { decodeCursor, encodeCursor } from "./pagination";
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostSummary,
  PostListPage,
  ProfileUpsert,
  ReactionValue,
} from "./types";

// ── raw DB row 타입 (정규화 전) ──────────────────────────────────────────────
// 목록은 본문을 제외(대역폭 절약). 상세만 body/updated_at을 추가로 읽는다.
interface RawPostSummaryRow {
  id: string;
  author_id: string;
  author_nick: string;
  author_profile_image: string | null;
  title: string;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  deleted_at: string | null;
  created_at: string;
}

interface RawPostRow extends RawPostSummaryRow {
  body: string;
  updated_at: string;
}

interface RawCommentRow {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  author_nick: string;
  author_profile_image: string | null;
  body: string;
  deleted_at: string | null;
  created_at: string;
}

/** postgres 에러 → HTTP 상태로 매핑. */
const mapPgError = (error: {
  message: string;
  code?: string;
}): SupabaseDataError => {
  const code = error.code;
  let status = 500;
  if (code === "23505")
    status = 409; // unique_violation
  else if (code === "23503")
    status = 404; // foreign_key_violation (글/프로필 없음)
  else if (code === "23514")
    status = 400; // check_violation (길이 위반)
  else if (code === "P0001") status = 400; // raise_exception (대댓글 깊이 트리거)
  return new SupabaseDataError({ message: error.message, status, code });
};

const normalizePostSummary = (r: RawPostSummaryRow): CommunityPostSummary => ({
  id: r.id,
  title: r.deleted_at ? "" : r.title,
  author: {
    userId: r.author_id,
    nick: r.author_nick,
    profileImage: r.author_profile_image,
  },
  likeCount: r.like_count,
  dislikeCount: r.dislike_count,
  commentCount: r.comment_count,
  createdAt: r.created_at,
  isDeleted: r.deleted_at != null,
});

const normalizePost = (
  r: RawPostRow,
  myReaction: ReactionValue | null,
): CommunityPost => ({
  ...normalizePostSummary(r),
  body: r.deleted_at ? "" : r.body,
  updatedAt: r.updated_at,
  myReaction,
});

const normalizeComment = (r: RawCommentRow): CommunityComment => ({
  id: r.id,
  postId: r.post_id,
  parentId: r.parent_id,
  author: {
    userId: r.author_id,
    nick: r.author_nick,
    profileImage: r.author_profile_image,
  },
  body: r.deleted_at ? "" : r.body, // 삭제 댓글 본문은 노출하지 않는다
  createdAt: r.created_at,
  isDeleted: r.deleted_at != null,
  replies: [],
});

const POST_SUMMARY_COLUMNS =
  "id,author_id,author_nick,author_profile_image,title,like_count,dislike_count,comment_count,deleted_at,created_at";
const POST_COLUMNS = `${POST_SUMMARY_COLUMNS},body,updated_at`;

// ── 프로필 ───────────────────────────────────────────────────────────────────
/** 쓰기/반응 시 호출 — 작성자의 현재 닉·프로필을 최신으로 유지한다. */
export const upsertProfile = async (p: ProfileUpsert): Promise<void> => {
  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .upsert(
      { user_id: p.userId, nick: p.nick, profile_image: p.profileImage },
      { onConflict: "user_id" },
    );
  if (error) throw mapPgError(error);
};

// ── 글 ───────────────────────────────────────────────────────────────────────
export const listPosts = async (opts: {
  cursor?: string;
  limit?: number;
}): Promise<PostListPage> => {
  const limit = opts.limit ?? 20;
  let query = getSupabaseAdmin()
    .from("posts")
    .select(POST_SUMMARY_COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1); // 다음 페이지 존재 여부 판단용 +1

  if (opts.cursor) {
    const { createdAt, id } = decodeCursor(opts.cursor);
    // keyset: (created_at, id) < (cursor) — created_at이 같을 때만 id로 tie-break
    query = query.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw mapPgError(error);

  const rows = (data ?? []) as RawPostSummaryRow[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  return {
    list: page.map(normalizePostSummary),
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.created_at, id: last.id })
        : null,
  };
};

/** 삭제된 글도 tombstone로 반환한다(상세 페이지에서 "삭제된 글" 표시 + 댓글 유지). */
export const getPost = async (
  id: string,
  viewerId?: string,
): Promise<CommunityPost | null> => {
  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .select(POST_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw mapPgError(error);
  if (!data) return null;

  const myReaction = viewerId ? await getMyReaction(id, viewerId) : null;
  return normalizePost(data as RawPostRow, myReaction);
};

export const createPost = async (input: {
  author: ProfileUpsert;
  title: string;
  body: string;
}): Promise<CommunityPost> => {
  await upsertProfile(input.author);
  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .insert({
      author_id: input.author.userId,
      author_nick: input.author.nick,
      author_profile_image: input.author.profileImage,
      title: input.title,
      body: input.body,
    })
    .select(POST_COLUMNS)
    .single();
  if (error) throw mapPgError(error);
  return normalizePost(data as RawPostRow, null);
};

/** 본인 글만 soft delete. 없으면 404, 타인 글이면 403. */
export const softDeletePost = async (
  id: string,
  authorId: string,
): Promise<void> => {
  const admin = getSupabaseAdmin();
  const { data: existing, error: selErr } = await admin
    .from("posts")
    .select("author_id,deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (selErr) throw mapPgError(selErr);
  if (!existing || existing.deleted_at) {
    throw new SupabaseDataError({ message: "Post not found", status: 404 });
  }
  if (existing.author_id !== authorId) {
    throw new SupabaseDataError({ message: "Forbidden", status: 403 });
  }
  const { error } = await admin
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw mapPgError(error);
};

// ── 댓글 + 대댓글 ─────────────────────────────────────────────────────────────
/** 한 번의 쿼리로 가져와 JS에서 1단계 트리로 조립한다. */
export const listComments = async (
  postId: string,
): Promise<CommunityComment[]> => {
  const { data, error } = await getSupabaseAdmin()
    .from("comments")
    .select(
      "id,post_id,parent_id,author_id,author_nick,author_profile_image,body,deleted_at,created_at",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw mapPgError(error);

  const rows = (data ?? []) as RawCommentRow[];
  const byId = new Map<string, CommunityComment>();
  for (const r of rows) byId.set(r.id, normalizeComment(r));

  const tops: CommunityComment[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parent_id) {
      byId.get(r.parent_id)?.replies.push(node);
    } else {
      tops.push(node);
    }
  }

  // 삭제된 답글은 숨긴다. 최상위 댓글을 지우면 대댓글도 함께 삭제되므로(softDeleteComment)
  // 보통은 스레드 전체가 사라진다. 단, 살아 있는 답글이 남은 (구버전 데이터 등) 삭제 댓글은
  // 답글 맥락을 위해 tombstone("삭제된 댓글")로 유지한다.
  for (const top of tops) {
    top.replies = top.replies.filter((reply) => !reply.isDeleted);
  }
  return tops.filter((top) => !top.isDeleted || top.replies.length > 0);
};

export const createComment = async (input: {
  postId: string;
  parentId?: string | null;
  author: ProfileUpsert;
  body: string;
}): Promise<CommunityComment> => {
  await upsertProfile(input.author);
  const { data, error } = await getSupabaseAdmin()
    .from("comments")
    .insert({
      post_id: input.postId,
      parent_id: input.parentId ?? null,
      author_id: input.author.userId,
      author_nick: input.author.nick,
      author_profile_image: input.author.profileImage,
      body: input.body,
    })
    .select(
      "id,post_id,parent_id,author_id,author_nick,author_profile_image,body,deleted_at,created_at",
    )
    .single();
  if (error) throw mapPgError(error); // 깊이 트리거 위반 → 400, FK(글 없음) → 404
  return normalizeComment(data as RawCommentRow);
};

/** 본인 댓글만 soft delete. */
export const softDeleteComment = async (
  id: string,
  authorId: string,
): Promise<void> => {
  const admin = getSupabaseAdmin();
  const { data: existing, error: selErr } = await admin
    .from("comments")
    .select("author_id,deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (selErr) throw mapPgError(selErr);
  if (!existing || existing.deleted_at) {
    throw new SupabaseDataError({ message: "Comment not found", status: 404 });
  }
  if (existing.author_id !== authorId) {
    throw new SupabaseDataError({ message: "Forbidden", status: 403 });
  }
  // 댓글을 지우면 그 대댓글도 함께 soft delete 한다.
  // 대댓글은 1단계까지만 허용되므로 자식(parent_id = id) 한 단계만 처리하면 충분하다.
  // 이미 삭제된 행은 건드리지 않아 각자의 최초 삭제 시각을 보존한다.
  const { error } = await admin
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .or(`id.eq.${id},parent_id.eq.${id}`)
    .is("deleted_at", null);
  if (error) throw mapPgError(error);
};

// ── 반응(좋아요/싫어요) ──────────────────────────────────────────────────────
export const getMyReaction = async (
  postId: string,
  userId: string,
): Promise<ReactionValue | null> => {
  const { data, error } = await getSupabaseAdmin()
    .from("reactions")
    .select("value")
    .eq("target_type", "post")
    .eq("target_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw mapPgError(error);
  return (data?.value as ReactionValue | undefined) ?? null;
};

/** 토글: 같은 값 재클릭→해제, 다른 값→전환, 없음→생성. 갱신된 카운트와 내 반응을 반환. */
export const setReaction = async (input: {
  postId: string;
  user: ProfileUpsert;
  value: ReactionValue;
}): Promise<{
  myReaction: ReactionValue | null;
  likeCount: number;
  dislikeCount: number;
}> => {
  const admin = getSupabaseAdmin();

  // 대상 글 존재 확인 (reactions는 다형성이라 FK가 없음)
  const { data: post, error: postErr } = await admin
    .from("posts")
    .select("id,deleted_at")
    .eq("id", input.postId)
    .maybeSingle();
  if (postErr) throw mapPgError(postErr);
  if (!post || post.deleted_at) {
    throw new SupabaseDataError({ message: "Post not found", status: 404 });
  }

  await upsertProfile(input.user); // reactions.user_id → profiles FK

  const { data: existing, error: selErr } = await admin
    .from("reactions")
    .select("id,value")
    .eq("target_type", "post")
    .eq("target_id", input.postId)
    .eq("user_id", input.user.userId)
    .maybeSingle();
  if (selErr) throw mapPgError(selErr);

  let myReaction: ReactionValue | null;
  if (!existing) {
    const { error } = await admin.from("reactions").insert({
      target_type: "post",
      target_id: input.postId,
      user_id: input.user.userId,
      value: input.value,
    });
    if (error) throw mapPgError(error);
    myReaction = input.value;
  } else if (existing.value === input.value) {
    const { error } = await admin
      .from("reactions")
      .delete()
      .eq("id", existing.id);
    if (error) throw mapPgError(error);
    myReaction = null;
  } else {
    const { error } = await admin
      .from("reactions")
      .update({ value: input.value })
      .eq("id", existing.id);
    if (error) throw mapPgError(error);
    myReaction = input.value;
  }

  // 트리거가 posts 카운터를 갱신했으므로 다시 읽는다.
  const { data: counts, error: cErr } = await admin
    .from("posts")
    .select("like_count,dislike_count")
    .eq("id", input.postId)
    .single();
  if (cErr) throw mapPgError(cErr);
  return {
    myReaction,
    likeCount: counts.like_count as number,
    dislikeCount: counts.dislike_count as number,
  };
};

// ── heartbeat (무료 티어 자동 일시정지 회피) ─────────────────────────────────
export const pingDatabase = async (): Promise<void> => {
  const { error } = await getSupabaseAdmin()
    .from("posts")
    .select("id")
    .limit(1);
  if (error) throw mapPgError(error);
};
