"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";
import { useMockAuth } from "@/lib/auth/mock-auth-context";

export function AccountMenu() {
  const t = useTranslations("header");
  const { isAuthenticated, role, displayName, signIn, signOut } = useMockAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-saa-text hover:bg-white/5"
        aria-label="Account menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-saa-bg-elev py-1 text-sm shadow-xl">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-2 text-xs text-saa-muted">{displayName}</div>
              <Link href="/about-saa-2025" className="block px-4 py-2 hover:bg-white/5" role="menuitem" onClick={() => setOpen(false)}>
                {t("profile")}
              </Link>
              {role === "admin" && (
                <Link href="/admin-dashboard" className="block px-4 py-2 hover:bg-white/5" role="menuitem" onClick={() => setOpen(false)}>
                  {t("adminDashboard")}
                </Link>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); signOut(); }}
                className="block w-full px-4 py-2 text-left hover:bg-white/5"
              >
                {t("signOut")}
              </button>
            </>
          ) : process.env.NODE_ENV === "development" ? (
            <>
              <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-saa-muted">
                Dev only — mock sign-in
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); signIn("regular"); }}
                className="block w-full px-4 py-2 text-left hover:bg-white/5"
              >
                Sign in as regular
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); signIn("admin"); }}
                className="block w-full px-4 py-2 text-left hover:bg-white/5"
              >
                Sign in as admin
              </button>
            </>
          ) : (
            <Link href="/login" className="block px-4 py-2 hover:bg-white/5" role="menuitem" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
