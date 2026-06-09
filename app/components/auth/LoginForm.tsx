"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hashSecretCode } from "@/lib/crypto";
import { useAuth } from "@/hooks/useAuth";

/**
 * Login form — verifies secret code for an existing device.
 * Supports entering either the Short Code or the Device ID.
 */
export default function LoginForm() {
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedCode = secretCode.trim();
    const numericRegex = /^\d{6}$/;
    if (!numericRegex.test(trimmedCode)) {
      setError("Secret code must be exactly a 6-digit number (0-9).");
      return;
    }

    setIsLoading(true);

    try {
      const secretHash = await hashSecretCode(trimmedCode);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretHash }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        return;
      }

      // Save credentials in client state and sessionStorage
      login(data.deviceId, data.shortCode);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" id="login-form">
      <div className="form-group">
        <label htmlFor="login-secret-code" className="form-label">
          6-Digit Secret Code
        </label>
        <input
          id="login-secret-code"
          type="password"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="e.g. 123456"
          className="form-input"
          required
          autoComplete="current-password"
          disabled={isLoading}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
        id="login-btn"
      >
        {isLoading ? (
          <span className="btn-loading">Verifying...</span>
        ) : (
          "Verify Identity"
        )}
      </button>
    </form>
  );
}
