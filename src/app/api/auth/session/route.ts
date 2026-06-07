import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { authenticated: true, user: session.user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
