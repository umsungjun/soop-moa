// 커뮤니티 도메인 계약 타입 — raw DB row를 정규화한 결과(서버·클라이언트 공용).

export type ReactionValue = "like" | "dislike";

/** 작성자 표시 정보 (posts/comments 스냅샷 또는 profiles에서 정규화). */
export interface AuthorRef {
  userId: string;
  nick: string;
  profileImage: string | null;
}

/** 목록용 글 요약 (본문 제외). */
export interface CommunityPostSummary {
  id: string;
  title: string;
  author: AuthorRef;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: string; // ISO
  isDeleted: boolean;
}

/** 상세용 글 (본문 + 내 반응 포함). */
export interface CommunityPost extends CommunityPostSummary {
  body: string;
  updatedAt: string;
  myReaction: ReactionValue | null;
}

/** 댓글 — replies는 1단계 대댓글만 채워진다(최상위 댓글에서만). */
export interface CommunityComment {
  id: string;
  postId: string;
  parentId: string | null;
  author: AuthorRef;
  body: string;
  createdAt: string; // ISO
  isDeleted: boolean;
  replies: CommunityComment[];
}

/** keyset 페이지네이션 결과. nextCursor가 null이면 마지막 페이지. */
export interface PostListPage {
  list: CommunityPostSummary[];
  nextCursor: string | null;
}

/** 쓰기 시 세션에서 파생되는 작성자 upsert 페이로드. */
export interface ProfileUpsert {
  userId: string;
  nick: string;
  profileImage: string | null;
}
