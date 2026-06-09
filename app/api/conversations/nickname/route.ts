import { updateConversationNickname } from "@/services/messages";
import { NextResponse } from "next/server";

/**
 * POST /api/conversations/nickname
 * Set or clear the nickname of a partner in a conversation.
 * Body: { conversationId: string, deviceId: string, nickname: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, deviceId, nickname } = body;

    if (!conversationId || !deviceId) {
      return NextResponse.json(
        { error: "conversationId and deviceId are required." },
        { status: 400 }
      );
    }

    const result = await updateConversationNickname(
      conversationId,
      deviceId,
      nickname
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
