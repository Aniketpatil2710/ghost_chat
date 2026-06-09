"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { formatTimestamp, truncateDeviceId } from "@/utils/helpers";
import SwipeableBubble from "./SwipeableBubble";

/**
 * Scrollable message list with sent/received alignment.
 * Auto-scrolls to the newest message.
 */
export default function MessageList({
  messages,
  currentDeviceId,
  isLoading,
  onReply,
}: {
  messages: Message[];
  currentDeviceId: string;
  isLoading: boolean;
  onReply: (message: Message) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="message-list">
        <div className="message-list-empty">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="message-list-empty">
          <p className="message-list-empty-icon">👻</p>
          <p>No messages yet.</p>
          <p className="message-list-empty-hint">Send a message to start the conversation!</p>
        </div>
      </div>
    );
  }

  const handleScrollToParent = (parentId: number) => {
    const el = document.getElementById(`msg-${parentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-pulse");
      setTimeout(() => {
        el.classList.remove("highlight-pulse");
      }, 1500);
    }
  };

  return (
    <div className="message-list">
      {messages.map((msg) => {
        const isSent = msg.sender_id?.toLowerCase().trim() === currentDeviceId?.toLowerCase().trim();
        console.log("Message:", msg.content, "isSent:", isSent, "sender_id:", msg.sender_id, "currentDeviceId:", currentDeviceId);
        
        const parentMsg = msg.parent_message_id
          ? messages.find((m) => m.id === msg.parent_message_id)
          : null;

        return (
          <div key={msg.id} id={`msg-${msg.id}`} className="message-row">
            <SwipeableBubble message={msg} isSent={isSent} onReply={onReply}>
              <div
                className={`message-bubble ${isSent ? "message-sent" : "message-received"}`}
                data-sender-id={msg.sender_id}
                data-is-sent={isSent}
              >
                {/* Quoted Message Preview */}
                {parentMsg && (
                  <div
                    className="reply-quote-preview"
                    onClick={() => handleScrollToParent(parentMsg.id)}
                    title="Click to view original message"
                  >
                    <p className="reply-quote-sender">
                      {parentMsg.sender_id === currentDeviceId ? "You" : "Partner"}
                    </p>
                    <p className="reply-quote-text">{parentMsg.content}</p>
                  </div>
                )}

                <p className="message-content">{msg.content}</p>
                <span className="message-time">
                  {formatTimestamp(msg.created_at)}
                </span>
              </div>
            </SwipeableBubble>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
