"use client";

import { useEffect, useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";

import { createKudos } from "@/lib/kudos/actions";
import { useRouter } from "@/lib/i18n/navigation";
import type { KudosPerson, KudosHashtag, CreateKudosInput } from "@/lib/kudos/types";

import { useComposeModal } from "./compose-modal-context";
import { useKudosBoard } from "../kudos-board-context";
import { ComposeKudoForm } from "./compose-kudo-form";

type Props = {
  people: KudosPerson[];
  hashtags: KudosHashtag[];
};

export function ComposeKudoModal({ people, hashtags }: Props) {
  const t = useTranslations("kudos.compose");
  const router = useRouter();
  const { isOpen, close } = useComposeModal();
  const { showToast } = useKudosBoard();
  const [submitting, startTransition] = useTransition();

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Esc key to close.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    },
    [close],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleSubmit = useCallback(
    (input: CreateKudosInput) => {
      startTransition(async () => {
        try {
          await createKudos(input);
          close();
          router.refresh(); // surface the new kudos on the board
          showToast(t("successToast"));
        } catch {
          showToast(t("errorToast"));
        }
      });
    },
    [close, router, showToast, t],
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("modalTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={close} aria-hidden="true" />

      {/* Cream/parchment panel — rgba(255,248,225,1) per Figma node specs */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-[752px] flex-col overflow-y-auto rounded-[24px] p-[40px]"
        style={{ backgroundColor: "rgba(255, 248, 225, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-8 text-center font-['Montserrat'] text-[32px] font-bold leading-[40px] text-[#00101A]">
          {t("modalTitle")}
        </h2>

        <ComposeKudoForm
          people={people}
          hashtags={hashtags}
          onSubmit={handleSubmit}
          submitting={submitting}
          onCancel={close}
        />
      </div>
    </div>
  );
}
