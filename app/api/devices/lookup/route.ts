import { lookupDevice } from "@/services/devices";
import { NextResponse } from "next/server";

/**
 * GET /api/devices/lookup?query=...
 * Look up a device by UUID or 5-character short code.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query parameter is required." },
        { status: 400 }
      );
    }

    const result = await lookupDevice(query);

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
