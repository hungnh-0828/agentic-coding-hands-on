"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

import type { KudosPost } from "@/lib/kudos/types";

export function LikeButton({ kudos }: { kudos: KudosPost }) {
  const t = useTranslations("kudos.card");
  const { currentUserId, toggleLike, isLikePendingForCard } = useKudosBoard();

  const totalWeight = kudos.likes.reduce((sum, l) => sum + l.weight, 0);
  const isLiked = currentUserId !== null && kudos.likes.some((l) => l.userId === currentUserId);
  const isOwner = currentUserId === kudos.sender.id;
  const disabled = isOwner || isLikePendingForCard(kudos.id) || currentUserId === null;

  return (
    <button
      type="button"
      onClick={() => toggleLike(kudos.id)}
      disabled={disabled}
      aria-pressed={isLiked}
      aria-label={t("likeAria", { count: totalWeight })}
      className="inline-flex items-center gap-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="tabular-nums text-saa-text/80">{totalWeight}</span>
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "fill-none text-saa-muted"}`}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  );
}
