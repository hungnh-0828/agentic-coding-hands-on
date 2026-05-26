"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function WidgetButton() {
  const t = useTranslations("widget");
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-56 overflow-hidden rounded-xl border border-white/10 bg-saa-bg-elev p-2 text-sm shadow-2xl">
          {(["nominate", "sendKudos", "contactOrganizer"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className="block w-full rounded px-3 py-2 text-left hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick actions"
        className="inline-flex h-16 w-[105px] items-center justify-center gap-2 rounded-full bg-saa-accent px-3 text-saa-bg shadow-lg hover:bg-saa-accent-soft"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5h2M5 11h2m10 0h2M11 17h2M7.05 7.05l1.41 1.41m7.08 7.08l1.41 1.41M7.05 16.95l1.41-1.41m7.08-7.08l1.41-1.41" />
        </svg>
        <span className="font-black">/</span>
        <span className="text-xs font-black">SAA</span>
      </button>
    </div>
  );
}
