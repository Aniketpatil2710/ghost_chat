"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { copyToClipboard, truncateDeviceId } from "@/utils/helpers";
import { getConversations } from "@/services/messages";
import type { Conversation } from "@/types";

/**
 * Dashboard — Device ID display, start new conversations, list existing ones.
 */
export default function DashboardPage() {
  const { deviceId, isAuthenticated, shortCode } = useAuth();
  const router = useRouter();
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedShortCode, setCopiedShortCode] = useState(false);
  const [partnerInput, setPartnerInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch conversations
  useEffect(() => {
    if (!deviceId) return;
    const load = async () => {
      setIsLoadingConversations(true);
      const result = await getConversations(deviceId);
      setConversations(result.conversations);
      setIsLoadingConversations(false);
    };
    load();
  }, [deviceId]);

  const handleCopyUuid = async () => {
    if (!deviceId) return;
    const success = await copyToClipboard(deviceId);
    if (success) {
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    }
  };

  const handleCopyShortCode = async () => {
    if (!shortCode) return;
    const success = await copyToClipboard(shortCode);
    if (success) {
      setCopiedShortCode(true);
      setTimeout(() => setCopiedShortCode(false), 2000);
    }
  };

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = partnerInput.trim();

    if (!trimmed) {
      setError("Please enter an account ID or short code.");
      return;
    }

    if (trimmed === deviceId || trimmed.toUpperCase() === shortCode?.toUpperCase()) {
      setError("You cannot chat with yourself.");
      return;
    }

    setIsStartingChat(true);

    try {
      // 1. Resolve short code / verify device exists
      const res = await fetch(`/api/devices/lookup?query=${trimmed}`);
      const data = await res.json();

      if (!res.ok || !data.exists) {
        setError("Account not found. Check the ID or short code.");
        setIsStartingChat(false);
        return;
      }

      // 2. Redirect to chat page with Resolved UUID
      router.push(`/chat/${data.deviceId}`);
    } catch {
      setError("Failed to look up device. Please try again.");
      setIsStartingChat(false);
    }
  };

  const getPartnerId = (conv: Conversation) => {
    return conv.participant_one === deviceId
      ? conv.participant_two
      : conv.participant_one;
  };

  const getConversationNickname = (conv: Conversation) => {
    return conv.participant_one === deviceId
      ? conv.nickname_for_two
      : conv.nickname_for_one;
  };

  if (!isAuthenticated || !deviceId) return null;

  return (
    <div className="dashboard-container">
      {/* Device ID Card */}
      <div className="glass-card device-card">
        <h2 className="card-title">Your Anonymous Identity</h2>
        
        {/* Short Code Display (Primary sharing option) */}
        {shortCode && (
          <div className="short-code-section mb-4">
            <span className="info-label">Share Short Code:</span>
            <div className="short-code-display">
              <span className="short-code-value">{shortCode}</span>
              <button
                onClick={handleCopyShortCode}
                className="btn btn-primary btn-sm copy-btn"
                id="copy-short-code"
              >
                {copiedShortCode ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="device-id-hint">
              This is a simple 5-digit code you can share for easy chatting.
            </p>
          </div>
        )}

        {/* UUID Display (Detailed) */}
        <div className="uuid-section">
          <span className="info-label">Full Account Address:</span>
          <div className="device-id-display">
            <code className="device-id-code">{deviceId}</code>
            <button
              onClick={handleCopyUuid}
              className="btn btn-secondary btn-sm copy-btn"
              id="copy-device-id"
            >
              {copiedUuid ? "✓ Copied" : "Copy ID"}
            </button>
          </div>
        </div>
      </div>

      {/* Start Conversation Card */}
      <div className="glass-card">
        <h2 className="card-title">Start a Conversation</h2>
        <form onSubmit={handleStartChat} className="start-chat-form">
          <input
            id="partner-id-input"
            type="text"
            value={partnerInput}
            onChange={(e) => setPartnerInput(e.target.value)}
            placeholder="Enter a 5-digit short code or full account ID"
            className="form-input"
            disabled={isStartingChat}
            maxLength={36}
          />
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            id="start-chat-btn"
            disabled={isStartingChat}
          >
            {isStartingChat ? "Connecting..." : "Start Chat"}
          </button>
        </form>
      </div>

      {/* Conversations List */}
      <div className="glass-card">
        <h2 className="card-title">Conversations</h2>
        {isLoadingConversations ? (
          <div className="conversations-loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="conversations-empty">
            <p>No conversations yet.</p>
            <p className="conversations-empty-hint">
              Enter a code or device ID above to start chatting!
            </p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => {
              const partner = getPartnerId(conv);
              const nickname = getConversationNickname(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/chat/${partner}`)}
                  className="conversation-item"
                >
                  <div className="conversation-avatar">
                    <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                      <path
                        d="M32 4C18.745 4 8 14.745 8 28v24c0 2 1 4 3 4s3-2 4-4 2-4 4-4 3 2 4 4 1 4 3 4 3-2 4-4 2-4 4-4 3 2 4 4 1 4 3 4 3-2 3-4V28C44 14.745 45.255 4 32 4z"
                        fill="currentColor"
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                  <div className="conversation-info">
                    <p className="conversation-name" title={partner}>
                      {nickname || truncateDeviceId(partner)}
                    </p>
                    <p className="conversation-hint">
                      {nickname ? `Address: ${truncateDeviceId(partner)}` : "Tap to continue chatting"}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="conversation-arrow"
                  >
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
