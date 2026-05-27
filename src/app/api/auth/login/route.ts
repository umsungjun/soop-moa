import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { buildAuthorizeUrl } from "@/domains/auth/utils/build-authorize-url";
import { getSession } from "@/lib/session/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const state = nanoid();
  session.oauthState = state;
  await session.save();

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
