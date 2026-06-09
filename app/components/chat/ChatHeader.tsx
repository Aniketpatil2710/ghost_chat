"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { truncateDeviceId } from "@/utils/helpers";

/**
 * Chat header bar — shows partner device info, custom nickname editor, and back button.
 */
export default function ChatHeader({
  partnerDeviceId,
  partnerShortCode,
  nickname,
  onSaveNickname,
}: {
  partnerDeviceId: string;
  partnerShortCode: string | null;
  nickname: string | null;
  onSaveNickname: (nickname: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(nickname || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNameInput(nickname || "");
  }, [nickname]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSaveNickname(nameInput);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = nickname || (partnerShortCode ? `Identity ${partnerShortCode}` : truncateDeviceId(partnerDeviceId));

  return (
    <div className="chat-header">
      <Link href="/dashboard" className="chat-back-btn" aria-label="Back to dashboard">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <div className="chat-header-info">
        <div className="chat-header-avatar">
          <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4C18.745 4 8 14.745 8 28v24c0 2 1 4 3 4s3-2 4-4 2-4 4-4 3 2 4 4 1 4 3 4 3-2 4-4 2-4 4-4 3 2 4 4 1 4 3 4 3-2 3-4V28C44 14.745 45.255 4 32 4z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="chat-header-name-container">
          {isEditing ? (
            <form onSubmit={handleSave} className="nickname-edit-form">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Set nickname..."
                className="nickname-input"
                maxLength={20}
                autoFocus
                disabled={isSaving}
              />
              <button type="submit" className="nickname-save-btn" disabled={isSaving}>
                ✓
              </button>
              <button
                type="button"
                className="nickname-cancel-btn"
                onClick={() => {
                  setNameInput(nickname || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="nickname-display-row">
              <span className="chat-header-name" title={partnerDeviceId}>
                {displayName}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="nickname-edit-trigger"
                title="Edit Nickname"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
          <p className="chat-header-status">
            {nickname ? `Address: ${truncateDeviceId(partnerDeviceId)}` : "Anonymous Account"}
          </p>
        </div>
      </div>
    </div>
  );
}
