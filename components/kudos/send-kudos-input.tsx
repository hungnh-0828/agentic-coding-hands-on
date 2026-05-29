"use client";

import { useTranslations } from "next-intl";

import { useComposeModal } from "./compose/compose-modal-context";

export function SendKudosInput() {
  const t = useTranslations("kudos.sendInput");
  const { open } = useComposeModal();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={open}
        className="flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-saa-bg-elev/70 px-5 py-3 text-left text-sm text-saa-muted shadow-inner transition hover:border-saa-accent/40 hover:text-saa-text"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-saa-accent" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5l8 8-4 4H7v-8l4-4z" />
        </svg>
        {t("placeholder")}
      </button>

      {/* Profile search — visual only in this iteration (no backend search yet). */}
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-saa-bg-elev/70 px-5 py-3 focus-within:border-saa-accent/40 focus-within:ring-1 focus-within:ring-saa-accent/40 sm:w-72">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-saa-muted" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="search"
          aria-label={t("searchPlaceholder")}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent text-sm text-saa-text placeholder:text-saa-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
