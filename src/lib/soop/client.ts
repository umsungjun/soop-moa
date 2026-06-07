import "server-only";
import { getServerEnv, publicConfig } from "@/lib/env";
import { SOOP_API_BASE, SOOP_ENDPOINTS } from "./endpoints";
import { SoopApiError } from "./errors";
import type {
  Category,
  LiveBroadcast,
  SoopBroadcast,
  SoopCategory,
  SoopStationInfo,
  SoopTokenResponse,
} from "./types";

const DEFAULT_TIMEOUT_MS = 8_000;

async function soopFetch(
  endpoint: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${SOOP_API_BASE}${endpoint}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: "*/*",
        ...rest.headers,
      },
    });
  } catch (err) {
    throw new SoopApiError({
      message: err instanceof Error ? err.message : "Network error",
      status: 0,
      endpoint,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function parseJson<T>(res: Response, endpoint: string): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new SoopApiError({
      message: `SOOP API ${res.status}: ${text.slice(0, 200)}`,
      status: res.status,
      endpoint,
    });
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SoopApiError({
      message: `Failed to parse SOOP response: ${text.slice(0, 200)}`,
      status: res.status,
      endpoint,
    });
  }
}

// ── OAuth ────────────────────────────────────────────────────────────

export async function requestAccessToken(
  code: string,
): Promise<SoopTokenResponse> {
  const { SOOP_CLIENT_SECRET } = getServerEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: publicConfig.NEXT_PUBLIC_SOOP_CLIENT_ID,
    client_secret: SOOP_CLIENT_SECRET,
    redirect_uri: publicConfig.NEXT_PUBLIC_SOOP_REDIRECT_URI,
    code,
  });
  const res = await soopFetch(SOOP_ENDPOINTS.authToken, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return parseJson<SoopTokenResponse>(res, SOOP_ENDPOINTS.authToken);
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<SoopTokenResponse> {
  const { SOOP_CLIENT_SECRET } = getServerEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: publicConfig.NEXT_PUBLIC_SOOP_CLIENT_ID,
    client_secret: SOOP_CLIENT_SECRET,
    redirect_uri: publicConfig.NEXT_PUBLIC_SOOP_REDIRECT_URI,
    refresh_token: refreshToken,
  });
  const res = await soopFetch(SOOP_ENDPOINTS.authToken, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return parseJson<SoopTokenResponse>(res, SOOP_ENDPOINTS.authToken);
}

// ── Broadcast list ───────────────────────────────────────────────────

export interface BroadListParams {
  selectKey?: "cate" | "lang";
  selectValue?: string;
  orderType?: "view_cnt" | "broad_start";
  pageNo?: number;
}

function withHttps(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function normalizeBroadcast(raw: SoopBroadcast): LiveBroadcast {
  const grade = Number(raw.broad_grade ?? 0);
  return {
    bjId: raw.user_id,
    bjNick: raw.user_nick,
    broadNo: raw.broad_no,
    title: raw.broad_title,
    categoryNo: raw.broad_cate_no,
    viewerCount: Number(raw.total_view_cnt ?? 0) || 0,
    thumbnail: withHttps(raw.broad_thumb),
    profileImage: withHttps(raw.profile_img),
    startedAt: raw.broad_start,
    adult: grade >= 19,
  };
}

export async function getBroadList(
  params: BroadListParams = {},
): Promise<LiveBroadcast[]> {
  const query = new URLSearchParams({
    client_id: publicConfig.NEXT_PUBLIC_SOOP_CLIENT_ID,
    select_key: params.selectKey ?? "cate",
    order_type: params.orderType ?? "view_cnt",
    page_no: String(params.pageNo ?? 1),
  });
  if (params.selectValue) query.set("select_value", params.selectValue);

  const endpoint = `${SOOP_ENDPOINTS.broadList}?${query.toString()}`;
  const res = await soopFetch(endpoint);
  const json = await parseJson<{ broad?: SoopBroadcast[] }>(res, endpoint);
  return (json.broad ?? []).map(normalizeBroadcast);
}

export async function getCategoryList(): Promise<Category[]> {
  const query = new URLSearchParams({
    client_id: publicConfig.NEXT_PUBLIC_SOOP_CLIENT_ID,
  });
  const endpoint = `${SOOP_ENDPOINTS.broadCategoryList}?${query.toString()}`;
  const res = await soopFetch(endpoint);
  const json = await parseJson<{ broad_category?: SoopCategory[] }>(
    res,
    endpoint,
  );
  // Flatten to top-level categories for the filter chips.
  return (json.broad_category ?? []).map((c) => ({
    no: c.cate_no,
    name: c.cate_name,
  }));
}

// ── User station info (authenticated) ────────────────────────────────

export async function getStationInfo(
  accessToken: string,
): Promise<SoopStationInfo> {
  const body = new URLSearchParams({ access_token: accessToken });
  const res = await soopFetch(SOOP_ENDPOINTS.userStationInfo, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await parseJson<{ data?: SoopStationInfo } | SoopStationInfo>(
    res,
    SOOP_ENDPOINTS.userStationInfo,
  );
  return "data" in json && json.data ? json.data : (json as SoopStationInfo);
}
