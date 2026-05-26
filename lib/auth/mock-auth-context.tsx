"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Role = "regular" | "admin";

type MockAuthState = {
  isAuthenticated: boolean;
  role: Role | null;
  displayName: string | null;
  signIn: (role?: Role) => void;
  signOut: () => void;
};

const MockAuthContext = createContext<MockAuthState | null>(null);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ isAuthenticated: boolean; role: Role | null; displayName: string | null }>({
    isAuthenticated: false,
    role: null,
    displayName: null,
  });

  const value = useMemo<MockAuthState>(
    () => ({
      ...state,
      signIn: (role: Role = "regular") =>
        setState({
          isAuthenticated: true,
          role,
          displayName: role === "admin" ? "Demo Admin" : "Demo User",
        }),
      signOut: () => setState({ isAuthenticated: false, role: null, displayName: null }),
    }),
    [state],
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error("useMockAuth must be used inside MockAuthProvider");
  return ctx;
}
