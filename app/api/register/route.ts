import { registerDevice } from "@/services/devices";
import { NextResponse } from "next/server";

/**
 * POST /api/register
 * Register a new device with a hashed secret code.
 * Body: { deviceId: string, secretHash: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, secretHash } = body;

    if (!deviceId || !secretHash) {
      return NextResponse.json(
        { error: "Account ID and secret hash are required." },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(deviceId)) {
      return NextResponse.json(
        { error: "Invalid account ID format." },
        { status: 400 }
      );
    }

    // Validate hash format (SHA-256 hex = 64 chars)
    if (secretHash.length !== 64) {
      return NextResponse.json(
        { error: "Invalid secret hash format." },
        { status: 400 }
      );
    }

    const result = await registerDevice(deviceId, secretHash);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, deviceId, shortCode: result.shortCode }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
