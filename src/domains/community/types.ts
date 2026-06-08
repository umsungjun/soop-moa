// 커뮤니티 도메인 타입 — 데이터 형태는 서버 계약(@/lib/supabase/types)을 재사용하고,
// 여기서는 API 응답 래퍼 계약만 추가로 정의한다.
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostSummary,
  ReactionValue,
} from "@/lib/supabase/types";

export type {
  CommunityComment,
  CommunityPost,
  CommunityPostSummary,
  ReactionValue,
};

export interface PostListResponse {
  list: CommunityPostSummary[];
  nextCursor: string | null;
}

export interface PostResponse {
  post: CommunityPost;
}

export interface CommentListResponse {
  list: CommunityComment[];
}

export interface CommentResponse {
  comment: CommunityComment;
}

export interface ReactionResponse {
  myReaction: ReactionValue | null;
  likeCount: number;
  dislikeCount: number;
}
