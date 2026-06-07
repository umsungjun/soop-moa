import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/session/helpers";
import { getStationInfo, requestAccessToken } from "@/lib/soop/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const session = await getSession();
  const expectedState = session.oauthState;
  session.oauthState = undefined;

  const fail = (reason: string) => {
    const url = new URL("/", siteConfig.url);
    url.searchParams.set("auth_error", reason);
    return NextResponse.redirect(url);
  };

  if (!code) {
    await session.save();
    return fail("missing_code");
  }
  if (!state || !expectedState || state !== expectedState) {
    await session.save();
    return fail("state_mismatch");
  }

  try {
    const token = await requestAccessToken(code);
    session.accessToken = token.access_token;
    session.refreshToken = token.refresh_token;
    session.expiresAt = Date.now() + token.expires_in * 1000;
    session.createdAt = Date.now();

    const info = await getStationInfo(token.access_token);
    session.user = {
      userNick: info.user_nick,
      stationName: info.station_name,
      profileImage: info.profile_image,
      userId: info.user_id,
    };
    await session.save();
  } catch (err) {
    console.error("[auth/callback] token exchange failed", err);
    await session.save();
    return fail("token_exchange_failed");
  }

  return NextResponse.redirect(new URL("/me", siteConfig.url));
}
