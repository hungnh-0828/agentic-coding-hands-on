"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";
import { KudosCard } from "./kudos-card";
import { KudosFilters } from "./kudos-filters";

function CircleArrow({
  dir,
  onClick,
  disabled,
  label,
  size = "md",
  decorative = false,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  label: string;
  size?: "sm" | "md";
  // `decorative` arrows duplicate the real pager controls for pointer users only;
  // keep them out of the tab order / a11y tree to avoid duplicate announcements.
  decorative?: boolean;
}) {
  const dim = size === "md" ? "h-11 w-11" : "h-8 w-8";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className={`inline-flex ${dim} items-center justify-center rounded-full border border-white/15 bg-saa-bg-elev/80 text-saa-text transition hover:border-saa-accent hover:text-saa-accent disabled:cursor-not-allowed disabled:opacity-30`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={dir === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
        />
      </svg>
    </button>
  );
}

export function HighlightSection() {
  const t = useTranslations("kudos.highlight");
  const tCard = useTranslations("kudos.card");
  const { highlightKudos } = useKudosBoard();
  const [index, setIndex] = useState(0);

  // Clamp index so it stays valid when the list shrinks via filtering.
  const total = highlightKudos.length;
  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);
  const current = highlightKudos[safeIndex];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-saa-muted">{t("eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold text-saa-accent sm:text-4xl">{t("title")}</h2>
        </div>
        <KudosFilters />
      </header>

      <div className="mt-10">
        {current ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full max-w-2xl">
              {/* Flanking navigation, pulled just outside the card on wide screens. */}
              <div className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 lg:-left-16">
                <CircleArrow dir="prev" decorative onClick={goPrev} disabled={safeIndex === 0} label={tCard("carouselPrev")} />
              </div>
              <KudosCard kudos={current} variant="highlight" />
              <div className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 lg:-right-16">
                <CircleArrow dir="next" decorative onClick={goNext} disabled={safeIndex === total - 1} label={tCard("carouselNext")} />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-saa-text">
              <CircleArrow dir="prev" size="sm" onClick={goPrev} disabled={safeIndex === 0} label={tCard("carouselPrev")} />
              <span className="font-semibold tabular-nums">
                {safeIndex + 1}/{total}
              </span>
              <CircleArrow dir="next" size="sm" onClick={goNext} disabled={safeIndex === total - 1} label={tCard("carouselNext")} />
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-saa-muted">{t("empty")}</p>
        )}
      </div>
    </section>
  );
}
