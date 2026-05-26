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
    <button type="button" onClick={handleCopy} className="text-sm text-saa-accent hover:underline">
      {t("copyLink")}
    </button>
  );
}
