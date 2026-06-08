/** Supabase 데이터 접근 계층의 에러 — 라우트 핸들러가 status로 HTTP 응답을 만든다. */
export class SupabaseDataError extends Error {
  readonly status: number; // 권장 HTTP 상태 (400/403/404/409/500)
  readonly code?: string; // postgres 에러 코드 (예: '23505' unique_violation)

  constructor(params: { message: string; status: number; code?: string }) {
    super(params.message);
    this.name = "SupabaseDataError";
    this.status = params.status;
    this.code = params.code;
  }
}
