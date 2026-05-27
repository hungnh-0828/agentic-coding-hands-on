"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ComposeModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ComposeModalContext = createContext<ComposeModalContextValue | null>(null);

export function ComposeModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ComposeModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ComposeModalContext.Provider>
  );
}

const NOOP_CTX: ComposeModalContextValue = {
  isOpen: false,
  open: () => {},
  close: () => {},
};

export function useComposeModal(): ComposeModalContextValue {
  const ctx = useContext(ComposeModalContext);
  // Returns a no-op context when used outside the provider (e.g. before
  // phase-05 mounts ComposeModalProvider on the page). This avoids a hard
  // crash and lets the page render without the modal until integration lands.
  return ctx ?? NOOP_CTX;
}
