"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useMockAuth } from "@/lib/auth/mock-auth-context";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const t = useTranslations("header");
  const tNotif = useTranslations("notifications");
  const { isAuthenticated } = useMockAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  const hasUnread = unreadCount > 0;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("notifications")}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-saa-text hover:bg-white/5"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.17V11a6 6 0 10-12 0v3.17a2 2 0 01-.6 1.43L4 17h5m6 0a3 3 0 11-6 0" />
        </svg>
        {hasUnread && (
          <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-saa-bg" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-white/10 bg-saa-bg-elev p-4 text-sm shadow-xl">
          <p className="font-medium">{t("notifications")}</p>
          <p className="mt-2 text-saa-muted">
            {hasUnread ? tNotif("unread", { count: unreadCount }) : tNotif("empty")}
          </p>
        </div>
      )}
    </div>
  );
}
