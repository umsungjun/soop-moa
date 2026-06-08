import { z } from "zod";

// 커뮤니티 API 요청 본문/쿼리 검증 스키마.
// 길이 상한은 DB CHECK 제약과 동일하게 맞춰 이중 방어한다.

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해 주세요.")
    .max(200, "제목은 200자 이내여야 합니다."),
  body: z
    .string()
    .trim()
    .min(1, "내용을 입력해 주세요.")
    .max(10000, "내용은 10,000자 이내여야 합니다."),
});

export const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "댓글 내용을 입력해 주세요.")
    .max(2000, "댓글은 2,000자 이내여야 합니다."),
  parentId: z.uuid().nullish(),
});

export const reactionSchema = z.object({
  value: z.enum(["like", "dislike"]),
});

export const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
