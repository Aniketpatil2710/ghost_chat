"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (deviceId: string, shortCode: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  deviceId: null,
  isAuthenticated: false,
  shortCode: null,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = "ghost_device_id";
const SHORT_CODE_KEY = "ghost_short_code";
const AUTH_KEY = "ghost_authenticated";

/**
 * AuthProvider — manages device identity via sessionStorage.
 * Wraps the app to provide auth state to all client components.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read from sessionStorage on mount
  useEffect(() => {
    const storedDeviceId = sessionStorage.getItem(STORAGE_KEY);
    const storedShortCode = sessionStorage.getItem(SHORT_CODE_KEY);
    const storedAuth = sessionStorage.getItem(AUTH_KEY);
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
      setShortCode(storedShortCode);
      setIsAuthenticated(storedAuth === "true");
    }
    setIsLoaded(true);
  }, []);

  const login = useCallback((id: string, code: string) => {
    sessionStorage.setItem(STORAGE_KEY, id);
    sessionStorage.setItem(SHORT_CODE_KEY, code);
    sessionStorage.setItem(AUTH_KEY, "true");
    setDeviceId(id);
    setShortCode(code);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SHORT_CODE_KEY);
    setDeviceId(null);
    setShortCode(null);
    setIsAuthenticated(false);
  }, []);

  // Don't render children until sessionStorage has been read
  // to prevent hydration mismatch / flicker
  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ deviceId, isAuthenticated, shortCode, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
