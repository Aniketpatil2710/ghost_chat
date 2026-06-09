"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/app/components/auth/RegisterForm";
import GhostLogo from "@/app/components/layout/GhostLogo";
import { useAuth } from "@/hooks/useAuth";

/**
 * Landing Page — Registration for new users.
 * If device already exists in sessionStorage, redirects to /login.
 */
export default function Home() {
  const { deviceId, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else if (deviceId) {
      router.push("/login");
    }
  }, [deviceId, isAuthenticated, router]);

  // Don't show form if redirecting
  if (deviceId) return null;

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-card-header">
          <GhostLogo size={64} />
          <h1 className="auth-title">Ghost Chat</h1>
          <p className="auth-subtitle">
            Anonymous. Private. No email. No phone. No identity.
          </p>
        </div>

        <div className="auth-card-body">
          <h2 className="auth-heading">Create Your Identity</h2>
          <p className="auth-description">
            Choose a secret code to secure your anonymous account. This is the
            only thing you need to remember.
          </p>
          <RegisterForm />
        </div>

        <div className="auth-card-footer">
          <p>
            Already have an account?{" "}
            <button
              onClick={() => {
                // Allow manual navigation to login even without stored deviceId
                // (edge case: cleared sessionStorage but device exists in DB)
                router.push("/login");
              }}
              className="auth-link"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
