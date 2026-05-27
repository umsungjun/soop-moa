import { NextResponse } from "next/server";
import {
  getSession,
  getValidAccessToken,
  isAuthenticated,
} from "@/lib/session/helpers";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    await getValidAccessToken(session);
    return NextResponse.json({ ok: true });
  } catch {
    session.destroy();
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
