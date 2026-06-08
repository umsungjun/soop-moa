// 클라이언트 측 폼 검증 — 서버(_schemas.ts)·DB CHECK과 동일한 상한을 사용한다.
// 통과 시 null, 실패 시 한국어 에러 메시지를 반환한다(parseBjId 스타일).

export const validatePostTitle = (value: string): string | null => {
  const v = value.trim();
  if (!v) return "제목을 입력해 주세요.";
  if (v.length > 200) return "제목은 200자 이내여야 합니다.";
  return null;
};

export const validatePostBody = (value: string): string | null => {
  const v = value.trim();
  if (!v) return "내용을 입력해 주세요.";
  if (v.length > 10000) return "내용은 10,000자 이내여야 합니다.";
  return null;
};

export const validateCommentBody = (value: string): string | null => {
  const v = value.trim();
  if (!v) return "댓글 내용을 입력해 주세요.";
  if (v.length > 2000) return "댓글은 2,000자 이내여야 합니다.";
  return null;
};
