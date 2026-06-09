"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";
import GhostLogo from "@/app/components/layout/GhostLogo";
import { useAuth } from "@/hooks/useAuth";

/**
 * Login Page — Secret code verification for returning users.
 */
export default function LoginPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-card-header">
          <GhostLogo size={64} />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Enter your secret code to access your anonymous identity.
          </p>
        </div>

        <div className="auth-card-body">
          <h2 className="auth-heading">Verify Identity</h2>
          <LoginForm />
        </div>

        <div className="auth-card-footer">
          <p>
            New here?{" "}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="auth-link"
            >
              Create an identity
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
