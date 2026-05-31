"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

export function CopyLinkButton({ kudosId }: { kudosId: string }) {
  const t = useTranslations("kudos.card");
  const { showToast } = useKudosBoard();

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#kudos-${kudosId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("copiedToast"));
    } catch {
      showToast("Không thể sao chép — kiểm tra quyền clipboard");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-saa-ink hover:underline"
    >
      {t("copyLink")}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    </button>
  );
}
