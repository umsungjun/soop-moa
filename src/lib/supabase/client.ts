import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, publicConfig } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * service_role 키로 RLS를 우회하는 서버 전용 싱글톤.
 * 이 모듈은 `server-only`라 클라이언트 번들에 포함되면 빌드가 실패한다.
 * 절대 키를 클라이언트로 노출하지 말 것.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!cached) {
    const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
    cached = createClient(
      publicConfig.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return cached;
}
