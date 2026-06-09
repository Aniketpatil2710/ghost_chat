import { verifyDeviceBySecretHash } from "@/services/devices";
import { NextResponse } from "next/server";

/**
 * POST /api/login
 * Verify a device's secret code hash.
 * Body: { secretHash: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secretHash } = body;

    if (!secretHash) {
      return NextResponse.json(
        { error: "Secret hash is required." },
        { status: 400 }
      );
    }

    const result = await verifyDeviceBySecretHash(secretHash);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, deviceId: result.deviceId, shortCode: result.shortCode }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
