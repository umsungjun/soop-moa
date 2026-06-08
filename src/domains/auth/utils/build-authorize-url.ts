import { SOOP_API_BASE, SOOP_ENDPOINTS } from "@/lib/soop/endpoints";

/**
 * Builds the SOOP OAuth authorization URL.
 * User is redirected here to log in and consent, then SOOP redirects back
 * to our callback with `?code=...&state=...`.
 *
 * `prompt=login`을 붙여 SOOP SSO 세션이 살아 있어도 로그인 화면을 띄우게 한다.
 * 이로써 로그아웃 후 다른 계정으로 로그인할 수 있다(무프롬프트 자동 재로그인 방지).
 * SOOP이 이 파라미터를 무시하면 기존과 동일하게 동작한다(안전).
 */
export function buildAuthorizeUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_SOOP_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_SOOP_REDIRECT_URI!;
  const query = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    prompt: "login",
  });
  return `${SOOP_API_BASE}${SOOP_ENDPOINTS.authCode}?${query.toString()}`;
}
