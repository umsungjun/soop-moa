import "server-only";

import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { refreshAccessToken } from "@/lib/soop/client";
import { getSessionOptions } from "./config";
import { isAuthenticated, type SessionData } from "./types";

const REFRESH_MARGIN_MS = 60_000; // refresh 1 min before expiry

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export async function clearSession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/** In-flight refresh deduplication within a single server instance. */
const inflightRefresh = new Map<string, Promise<void>>();

/**
 * Returns a valid access token, refreshing if near expiry.
 * Throws if the session is not authenticated or refresh fails.
 */
export async function getValidAccessToken(
  session: IronSession<SessionData>,
): Promise<string> {
  if (!session.accessToken || !session.refreshToken) {
    throw new Error("Not authenticated");
  }

  const notExpired =
    session.expiresAt && Date.now() < session.expiresAt - REFRESH_MARGIN_MS;
  if (notExpired) {
    return session.accessToken;
  }

  const key = session.refreshToken;
  let pending = inflightRefresh.get(key);
  if (!pending) {
    pending = (async () => {
      const token = await refreshAccessToken(session.refreshToken!);
      session.accessToken = token.access_token;
      session.refreshToken = token.refresh_token;
      session.expiresAt = Date.now() + token.expires_in * 1000;
      await session.save();
    })();
    inflightRefresh.set(key, pending);
    pending.finally(() => inflightRefresh.delete(key));
  }
  await pending;

  if (!session.accessToken) throw new Error("Refresh failed");
  return session.accessToken;
}

export { isAuthenticated };
