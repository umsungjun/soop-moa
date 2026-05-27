import { SOOP_API_BASE, SOOP_ENDPOINTS } from "@/lib/soop/endpoints";

/**
 * Builds the SOOP OAuth authorization URL.
 * User is redirected here to log in and consent, then SOOP redirects back
 * to our callback with `?code=...&state=...`.
 */
export function buildAuthorizeUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_SOOP_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_SOOP_REDIRECT_URI!;
  const query = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `${SOOP_API_BASE}${SOOP_ENDPOINTS.authCode}?${query.toString()}`;
}
