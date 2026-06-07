import "server-only";
import type { SessionOptions } from "iron-session";
import { getServerEnv } from "@/lib/env";

export const SESSION_COOKIE = "soop-moa-session";

export function getSessionOptions(): SessionOptions {
  const { IRON_SESSION_PASSWORD } = getServerEnv();
  return {
    password: IRON_SESSION_PASSWORD,
    cookieName: SESSION_COOKIE,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    },
  };
}
