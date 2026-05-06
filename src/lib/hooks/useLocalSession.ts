"use client";

import { useCallback, useEffect, useState } from "react";
import type { LocalSession } from "@/types/auth";
import {
  getMockSession,
  signInWithMockSession,
  signOutWithMockSession,
} from "@/lib/auth/mock-session";

const defaultSession: LocalSession = {
  isAuthenticated: false,
  user: null,
  signedInAt: null,
};

export function useLocalSession() {
  const [session, setSession] = useState<LocalSession>(defaultSession);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshSession = useCallback(() => {
    const nextSession = getMockSession();
    setSession(nextSession);
    return nextSession;
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const nextSession = getMockSession();
      setSession(nextSession);
      setIsHydrated(true);
    });
  }, []);

  const signIn = useCallback(() => {
    const nextSession = signInWithMockSession();
    setSession(nextSession);
    return nextSession;
  }, []);

  const signOut = useCallback(() => {
    const nextSession = signOutWithMockSession();
    setSession(nextSession);
    return nextSession;
  }, []);

  return {
    session,
    isHydrated,
    refreshSession,
    signIn,
    signOut,
  };
}

// Made with Bob
