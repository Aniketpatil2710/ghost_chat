"use client";

/**
 * Animated SVG ghost logo for Ghost Chat branding.
 */
export default function GhostLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ghost-logo"
      aria-label="Ghost Chat logo"
    >
      <defs>
        <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Ghost body */}
      <path
        d="M32 4C18.745 4 8 14.745 8 28v24c0 2 1 4 3 4s3-2 4-4 2-4 4-4 3 2 4 4 1 4 3 4 3-2 4-4 2-4 4-4 3 2 4 4 1 4 3 4 3-2 3-4V28C44 14.745 45.255 4 32 4z"
        fill="url(#ghostGrad)"
        opacity="0.9"
      />
      {/* Left eye */}
      <ellipse cx="24" cy="26" rx="3.5" ry="4.5" fill="#0f0f23">
        <animate
          attributeName="ry"
          values="4.5;0.5;4.5"
          dur="3s"
          repeatCount="indefinite"
          begin="1s"
        />
      </ellipse>
      {/* Right eye */}
      <ellipse cx="38" cy="26" rx="3.5" ry="4.5" fill="#0f0f23">
        <animate
          attributeName="ry"
          values="4.5;0.5;4.5"
          dur="3s"
          repeatCount="indefinite"
          begin="1s"
        />
      </ellipse>
      {/* Subtle floating animation is handled via CSS */}
    </svg>
  );
}
