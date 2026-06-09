"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hashSecretCode } from "@/lib/crypto";
import { generateDeviceId } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";

/**
 * Registration form — creates a new anonymous device identity.
 * Generates UUID, hashes secret code, calls /api/register.
 */
export default function RegisterForm() {
  const [secretCode, setSecretCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numericRegex = /^\d{6}$/;
    if (!numericRegex.test(secretCode)) {
      setError("Secret code must be exactly a 6-digit number (0-9).");
      return;
    }

    if (secretCode !== confirmCode) {
      setError("Secret codes do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const deviceId = generateDeviceId();
      const secretHash = await hashSecretCode(secretCode);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, secretHash }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      // Store device ID and mark as authenticated
      login(deviceId, data.shortCode);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" id="register-form">
      <div className="form-group">
        <label htmlFor="secret-code" className="form-label">
          Create 6-Digit Secret Code
        </label>
        <input
          id="secret-code"
          type="password"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="e.g. 123456"
          className="form-input"
          required
          autoComplete="new-password"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirm-code" className="form-label">
          Confirm 6-Digit Secret Code
        </label>
        <input
          id="confirm-code"
          type="password"
          value={confirmCode}
          onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="e.g. 123456"
          className="form-input"
          required
          autoComplete="new-password"
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
        id="register-btn"
      >
        {isLoading ? (
          <span className="btn-loading">Creating Identity...</span>
        ) : (
          "Create Anonymous Identity"
        )}
      </button>
    </form>
  );
}
