"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Message } from "@/types";

interface SwipeableBubbleProps {
  message: Message;
  isSent: boolean;
  onReply: (message: Message) => void;
  children: React.ReactNode;
}

export default function SwipeableBubble({
  message,
  isSent,
  onReply,
  children,
}: SwipeableBubbleProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [isAnimatingBack, setIsAnimatingBack] = useState(false);

  const startX = useRef(0);
  const currentX = useRef(0);
  const isMouseDown = useRef(false);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
    setIsAnimatingBack(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    // Only allow swiping to the right
    if (deltaX > 0) {
      // Clamp translation to max 75px
      const val = Math.min(deltaX * 0.8, 75); 
      setTranslateX(val);
      setIsTriggered(val >= 50);
    } else {
      setTranslateX(0);
      setIsTriggered(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    setIsAnimatingBack(true);

    if (translateX >= 50) {
      onReply(message);
    }

    setTranslateX(0);
    setIsTriggered(false);
  };

  // Mouse drag handlers for desktop (optional but cool)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse click
    if (e.button !== 0) return;
    startX.current = e.clientX;
    isMouseDown.current = true;
    setIsSwiping(true);
    setIsAnimatingBack(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !isSwiping) return;
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;

    if (deltaX > 0) {
      const val = Math.min(deltaX * 0.6, 75);
      setTranslateX(val);
      setIsTriggered(val >= 50);
    } else {
      setTranslateX(0);
      setIsTriggered(false);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    setIsSwiping(false);
    setIsAnimatingBack(true);

    if (translateX >= 50) {
      onReply(message);
    }

    setTranslateX(0);
    setIsTriggered(false);
  };

  // Remove animating class after transition finishes
  useEffect(() => {
    if (isAnimatingBack) {
      const timer = setTimeout(() => {
        setIsAnimatingBack(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isAnimatingBack]);

  const opacity = Math.min(translateX / 50, 1);
  const scale = Math.min(0.5 + (translateX / 50) * 0.5, 1.1);

  return (
    <div
      className={`swipe-bubble-container ${isSent ? "justify-end-align" : "justify-start-align"}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {/* Swipe Reply Icon (Behind Bubble) */}
      {translateX > 0 && (
        <div
          className={`swipe-reply-background ${isTriggered ? "triggered" : ""}`}
          style={{
            opacity,
            transform: `scale(${scale})`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        </div>
      )}

      {/* Message Bubble Wrapper (Translated) */}
      <div
        className={`swipe-bubble-content ${isAnimatingBack ? "returning" : ""}`}
        style={{
          transform: `translateX(${translateX}px)`,
          width: "100%",
          display: "flex",
          justifyContent: isSent ? "flex-end" : "flex-start",
        }}
      >
        <div className="message-bubble-wrapper">
          {children}

          {/* Desktop Hover Quick-Reply Button */}
          <button
            onClick={() => onReply(message)}
            className="desktop-reply-btn"
            title="Reply"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 10L4 15L9 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 4V11C20 12.0609 19.5786 13.0783 18.8284 13.8284C18.0783 14.5786 17.0609 15 16 15H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
