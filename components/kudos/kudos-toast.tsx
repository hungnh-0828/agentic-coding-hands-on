"use client";

import { useKudosBoard } from "./kudos-board-context";

// Bottom-right toast bound to the board context. Auto-dismiss handled in the provider.
export function KudosToast() {
  const { toast } = useKudosBoard();
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-saa-border bg-saa-bg-elev px-5 py-2.5 text-sm text-saa-text shadow-xl"
    >
      {toast}
    </div>
  );
}
