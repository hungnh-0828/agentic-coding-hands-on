"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

export function SendKudosInput() {
  const t = useTranslations("kudos");
  const { showToast } = useKudosBoard();

  return (
    <button
      type="button"
      onClick={() => showToast(t("todoToast"))}
      className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-white/10 bg-saa-bg-elev/70 px-5 py-3 text-left text-sm text-saa-muted shadow-inner transition hover:border-saa-accent/40 hover:text-saa-text"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-saa-accent" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5l8 8-4 4H7v-8l4-4z" />
      </svg>
      {t("sendInput.placeholder")}
    </button>
  );
}
