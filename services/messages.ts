/**
 * Ghost Chat — Message Service
 * Handles sending, fetching, and conversation management.
 */

import { supabase } from "@/lib/supabase";
import type { Message, Conversation } from "@/types";

/**
 * Send a message from one device to another.
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  parentMessageId?: number | null
): Promise<{ success: boolean; message?: Message; error?: string }> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
      parent_message_id: parentMessageId || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: data as Message };
}

/**
 * Fetch message history between two devices, ordered by creation time.
 */
export async function getMessages(
  deviceA: string,
  deviceB: string
): Promise<{ messages: Message[]; error?: string }> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${deviceA},receiver_id.eq.${deviceB}),and(sender_id.eq.${deviceB},receiver_id.eq.${deviceA})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    return { messages: [], error: error.message };
  }

  return { messages: (data as Message[]) || [] };
}

/**
 * Get or create a conversation between two devices.
 */
export async function getOrCreateConversation(
  deviceA: string,
  deviceB: string
): Promise<{ conversation?: Conversation; error?: string }> {
  // Sort participant IDs to ensure consistent ordering
  const [p1, p2] = [deviceA, deviceB].sort();

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("participant_one", p1)
    .eq("participant_two", p2)
    .single();

  if (existing) {
    return { conversation: existing as Conversation };
  }

  // Create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_one: p1,
      participant_two: p2,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { conversation: data as Conversation };
}

/**
 * Get all conversations for a device.
 */
export async function getConversations(
  deviceId: string
): Promise<{ conversations: Conversation[]; error?: string }> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_one.eq.${deviceId},participant_two.eq.${deviceId}`)
    .order("created_at", { ascending: false });

  if (error) {
    return { conversations: [], error: error.message };
  }

  return { conversations: (data as Conversation[]) || [] };
}

/**
 * Update the nickname for the other participant in a conversation.
 */
export async function updateConversationNickname(
  conversationId: string,
  deviceId: string,
  nickname: string
): Promise<{ success: boolean; error?: string }> {
  // Retrieve conversation to check participant roles
  const { data: conv, error: fetchError } = await supabase
    .from("conversations")
    .select("participant_one, participant_two")
    .eq("id", conversationId)
    .single();

  if (fetchError || !conv) {
    return { success: false, error: fetchError?.message || "Conversation not found." };
  }

  const updateData: Record<string, string | null> = {};
  const nicknameVal = nickname.trim() || null;

  if (conv.participant_one === deviceId) {
    // Nickname participant_two
    updateData.nickname_for_two = nicknameVal;
  } else if (conv.participant_two === deviceId) {
    // Nickname participant_one
    updateData.nickname_for_one = nicknameVal;
  } else {
    return { success: false, error: "Unauthorized." };
  }

  const { error } = await supabase
    .from("conversations")
    .update(updateData)
    .eq("id", conversationId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
