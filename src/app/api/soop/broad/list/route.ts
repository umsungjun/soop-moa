import { NextResponse, type NextRequest } from "next/server";
import { getBroadList, type BroadListParams } from "@/lib/soop/client";
import { SoopApiError } from "@/lib/soop/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const params: BroadListParams = {
    selectKey: (searchParams.get("select_key") as "cate" | "lang") ?? "cate",
    selectValue: searchParams.get("category") ?? undefined,
    orderType:
      (searchParams.get("order_type") as "view_cnt" | "broad_start") ??
      "view_cnt",
    pageNo: Number(searchParams.get("page") ?? "1"),
  };

  try {
    const list = await getBroadList(params);
    return NextResponse.json(
      { list },
      {
        headers: {
          "Cache-Control": "s-maxage=20, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    const status = err instanceof SoopApiError ? err.status || 502 : 500;
    return NextResponse.json(
      { error: "Failed to fetch broadcast list", list: [] },
      { status },
    );
  }
}
