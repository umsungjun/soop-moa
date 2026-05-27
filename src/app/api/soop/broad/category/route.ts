import { NextResponse } from "next/server";
import { getCategoryList } from "@/lib/soop/client";
import { SoopApiError } from "@/lib/soop/errors";

export async function GET() {
  try {
    const list = await getCategoryList();
    return NextResponse.json(
      { list },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    const status = err instanceof SoopApiError ? err.status || 502 : 500;
    return NextResponse.json(
      { error: "Failed to fetch categories", list: [] },
      { status },
    );
  }
}
