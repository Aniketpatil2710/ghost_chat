"use client";

import Link from "next/link";
import GhostLogo from "./GhostLogo";
import { useAuth } from "@/hooks/useAuth";

/**
 * App header — Ghost Chat branding + navigation.
 */
export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-brand">
          <GhostLogo size={36} />
          <span className="header-title">Ghost Chat</span>
        </Link>

        {isAuthenticated && (
          <nav className="header-nav">
            <Link href="/dashboard" className="header-link">
              Dashboard
            </Link>
            <button onClick={logout} className="header-link header-logout">
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
