"use client";

import Image from "next/image";
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
        className="inline-flex h-16 w-[105px] items-center justify-center gap-1.5 rounded-full bg-saa-accent-soft px-3 text-saa-bg shadow-lg hover:bg-saa-accent"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
        <span className="text-lg font-black">/</span>
        <Image src="/login/sun-annual-awards-logo.png" alt="SAA" width={28} height={26} className="h-6 w-auto" />
      </button>
    </div>
  );
}
