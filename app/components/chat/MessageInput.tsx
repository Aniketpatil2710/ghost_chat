"use client";

import { useState } from "react";
import type { Message } from "@/types";

/**
 * Message input with send button and slide-up reply preview.
 */
export default function MessageInput({
  onSend,
  disabled,
  replyTarget,
  onCancelReply,
}: {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  replyTarget: Message | null;
  onCancelReply: () => void;
}) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setContent("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      {/* Reply Preview Bar */}
      {replyTarget && (
        <div className="reply-preview-bar">
          <div className="reply-preview-info">
            <svg className="reply-preview-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 10L4 15L9 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 4V11C20 12.0609 19.5786 13.0783 18.8284 13.8284C18.0783 14.5786 17.0609 15 16 15H4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="reply-preview-text-container">
              <p className="reply-preview-title">
                Replying to {replyTarget.content.length > 0 ? "message" : ""}
              </p>
              <p className="reply-preview-content">{replyTarget.content}</p>
            </div>
          </div>
          <button
            type="button"
            className="reply-preview-cancel-btn"
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form" id="message-input-form">
        <textarea
          id="message-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="message-input"
          rows={1}
          disabled={disabled || isSending}
          autoComplete="off"
        />
        <button
          type="submit"
          className="message-send-btn"
          disabled={!content.trim() || isSending || disabled}
          aria-label="Send message"
          id="send-btn"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.333 1.667L9.167 10.833M18.333 1.667L12.5 18.333l-3.333-7.5-7.5-3.333L18.333 1.667z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
