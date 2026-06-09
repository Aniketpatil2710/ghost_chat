"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Message } from "@/types";

/**
 * Hook to subscribe to real-time messages between two devices
 * and maintain a live message list.
 */
export function useMessages(currentDeviceId: string, partnerDeviceId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial message history
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/messages?senderId=${currentDeviceId}&receiverId=${partnerDeviceId}`
      );
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch messages.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDeviceId, partnerDeviceId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time inserts on the messages table
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${[currentDeviceId, partnerDeviceId].sort().join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's relevant to this conversation
          const isRelevant =
            (newMsg.sender_id === currentDeviceId &&
              newMsg.receiver_id === partnerDeviceId) ||
            (newMsg.sender_id === partnerDeviceId &&
              newMsg.receiver_id === currentDeviceId);

          if (isRelevant) {
            setMessages((prev) => {
              // Prevent duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDeviceId, partnerDeviceId]);

  return { messages, isLoading, error };
}
