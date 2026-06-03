"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChange, getSession } from "@/features/auth/services";
import type { AuthUser } from "@/features/auth/types";
import type { Session } from "@supabase/supabase-js";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

function mapUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: (session.user.role as AuthUser["role"]) ?? "user",
  };
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const loadSession = useCallback(async () => {
    try {
      const session = await getSession();
      setState({ user: mapUser(session), loading: false });
    } catch {
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    loadSession();
    const { data } = onAuthStateChange((_event, rawSession) => {
      const session = rawSession as Session | null;
      setState({ user: mapUser(session), loading: false });
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadSession]);

  return state;
}
