import { SupabaseDataError } from "./errors";

/**
 * keyset 커서 = base64(`${createdAtISO}|${id}`).
 * posts(created_at desc, id desc) 인덱스 위에서 안정적인 무한스크롤을 제공한다.
 */
export interface PostCursor {
  createdAt: string;
  id: string;
}

export const encodeCursor = (cursor: PostCursor): string =>
  Buffer.from(`${cursor.createdAt}|${cursor.id}`, "utf8").toString("base64url");

export const decodeCursor = (raw: string): PostCursor => {
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  const sep = decoded.lastIndexOf("|");
  const createdAt = sep >= 0 ? decoded.slice(0, sep) : "";
  const id = sep >= 0 ? decoded.slice(sep + 1) : "";
  // 형식 검증 — 잘못된 커서는 400으로 매핑한다.
  if (!createdAt || !id || Number.isNaN(Date.parse(createdAt))) {
    throw new SupabaseDataError({ message: "Invalid cursor", status: 400 });
  }
  return { createdAt, id };
};
