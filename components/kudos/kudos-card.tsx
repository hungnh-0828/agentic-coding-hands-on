"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";
import { PersonBlock } from "./person-block";
import { KudosImageGallery } from "./kudos-image-gallery";
import { LikeButton } from "./like-button";
import { CopyLinkButton } from "./copy-link-button";

import type { KudosPost } from "@/lib/kudos/types";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

function SentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-4 h-6 w-6 shrink-0 text-saa-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function KudosCard({ kudos, variant = "feed" }: { kudos: KudosPost; variant?: "feed" | "highlight" }) {
  const t = useTranslations("kudos.card");
  const { showToast } = useKudosBoard();

  // Anonymous kudos hide the sender identity (no avatar, no dept, no badge).
  const isAnon = kudos.isAnonymous;
  const senderName = isAnon ? kudos.anonymousName || t("anonymous") : kudos.sender.name;

  return (
    <article
      id={`kudos-${kudos.id}`}
      className="flex flex-col gap-4 rounded-[24px] bg-saa-card px-6 pt-8 pb-4 text-saa-ink shadow-[0_18px_50px_-20px_rgba(0,0,0,0.55)] sm:px-10 sm:pt-10"
    >
      <header className="flex items-start gap-3">
        <PersonBlock
          name={senderName}
          dept={isAnon ? null : kudos.sender.departmentName}
          avatarUrl={isAnon ? null : kudos.sender.avatarUrl}
          badge={isAnon ? null : kudos.sender.badge}
          align="left"
        />
        <SentIcon />
        <PersonBlock
          name={kudos.receiver.name}
          dept={kudos.receiver.departmentName}
          avatarUrl={kudos.receiver.avatarUrl}
          badge={kudos.receiver.badge}
          align="right"
        />
      </header>

      <hr className="border-saa-ink/10" />

      <time className="text-xs font-medium text-saa-ink-soft">{formatTimestamp(kudos.createdAt)}</time>

      {kudos.title && (
        <div className="relative flex items-center justify-center">
          <h3 className="text-center text-sm font-bold uppercase tracking-wide text-saa-ink">{kudos.title}</h3>
          {variant === "feed" && (
            <button
              type="button"
              onClick={() => showToast(t("editTodo"))}
              aria-label={t("edit")}
              className="absolute right-0 text-saa-ink-soft hover:text-saa-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4v16h16v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-saa-card-inner px-5 py-4">
        <p className={`font-semibold leading-relaxed text-saa-ink ${variant === "feed" ? "line-clamp-5" : "line-clamp-3"}`}>
          {kudos.content}
        </p>
      </div>

      <KudosImageGallery urls={kudos.imageUrls} />

      {kudos.hashtags.length > 0 && (
        <p className="line-clamp-1 text-sm font-semibold text-saa-hashtag">
          {kudos.hashtags.slice(0, 5).map((h) => `#${h.label}`).join(" ")}
          {kudos.hashtags.length > 5 ? "…" : ""}
        </p>
      )}

      <footer className="flex items-center justify-between gap-4 border-t border-saa-ink/10 pt-4">
        <LikeButton kudos={kudos} />
        <div className="flex items-center gap-4">
          <CopyLinkButton kudosId={kudos.id} />
          {variant === "highlight" && (
            <button
              type="button"
              onClick={() => showToast(t("viewDetailTodo"))}
              className="text-sm font-semibold text-saa-ink hover:underline"
            >
              {t("viewDetail")}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
