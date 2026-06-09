import { sendMessage, getMessages } from "@/services/messages";
import { NextResponse } from "next/server";

/**
 * POST /api/messages
 * Send a message from one device to another.
 * Body: { senderId: string, receiverId: string, content: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, parentMessageId } = body;

    if (!senderId || !receiverId || !content?.trim()) {
      return NextResponse.json(
        { error: "senderId, receiverId, and content are required." },
        { status: 400 }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: "Cannot send a message to yourself." },
        { status: 400 }
      );
    }

    const result = await sendMessage(senderId, receiverId, content, parentMessageId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages?senderId=...&receiverId=...
 * Fetch message history between two devices.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: "senderId and receiverId query params are required." },
        { status: 400 }
      );
    }

    const result = await getMessages(senderId, receiverId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ messages: result.messages }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
