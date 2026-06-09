"use client";

import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { getOrCreateConversation } from "@/services/messages";
import { supabase } from "@/lib/supabase";
import type { Message, Conversation } from "@/types";
import ChatHeader from "@/app/components/chat/ChatHeader";
import MessageList from "@/app/components/chat/MessageList";
import MessageInput from "@/app/components/chat/MessageInput";

/**
 * Chat Page — Real-time messaging with a specific device.
 * Route: /chat/[deviceId]
 */
export default function ChatPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const { deviceId: partnerDeviceId } = use(params);
  const { deviceId, isAuthenticated } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [partnerShortCode, setPartnerShortCode] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load conversation & partner details on mount
  useEffect(() => {
    if (!deviceId || !partnerDeviceId) return;

    const loadDetails = async () => {
      // 1. Get/create conversation
      const result = await getOrCreateConversation(deviceId, partnerDeviceId);
      if (result.conversation) {
        setConversation(result.conversation);
      }

      // 2. Fetch partner's short code
      const { data } = await supabase
        .from("devices")
        .select("short_code")
        .eq("id", partnerDeviceId)
        .maybeSingle();
      if (data) {
        setPartnerShortCode(data.short_code);
      }
    };

    loadDetails();
  }, [deviceId, partnerDeviceId]);

  const { messages, isLoading, error } = useMessages(
    deviceId || "",
    partnerDeviceId
  );

  const handleSend = async (content: string) => {
    if (!deviceId) return;

    const parentId = replyTarget?.id || null;
    setReplyTarget(null); // Clear immediately for snappy UI

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: deviceId,
        receiverId: partnerDeviceId,
        content,
        parentMessageId: parentId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to send message:", data.error);
    }
  };

  const handleSaveNickname = async (nickname: string) => {
    if (!conversation || !deviceId) return;

    const res = await fetch("/api/conversations/nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversation.id,
        deviceId,
        nickname,
      }),
    });

    if (res.ok) {
      // Update local state
      setConversation((prev) => {
        if (!prev) return null;
        const isParticipantOne = prev.participant_one === deviceId;
        return {
          ...prev,
          nickname_for_two: isParticipantOne ? nickname : prev.nickname_for_two,
          nickname_for_one: !isParticipantOne ? nickname : prev.nickname_for_one,
        };
      });
    } else {
      const data = await res.json();
      console.error("Failed to update nickname:", data.error);
    }
  };

  if (!isAuthenticated || !deviceId) return null;

  // Determine active nickname (depending on user role)
  const currentNickname = conversation
    ? conversation.participant_one === deviceId
      ? conversation.nickname_for_two
      : conversation.nickname_for_one
    : null;

  return (
    <div className="chat-container">
      <ChatHeader
        partnerDeviceId={partnerDeviceId}
        partnerShortCode={partnerShortCode}
        nickname={currentNickname || null}
        onSaveNickname={handleSaveNickname}
      />

      {error && (
        <div className="chat-error" role="alert">
          {error}
        </div>
      )}

      <MessageList
        messages={messages}
        currentDeviceId={deviceId}
        isLoading={isLoading}
        onReply={setReplyTarget}
      />

      <MessageInput
        onSend={handleSend}
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
      />
    </div>
  );
}
