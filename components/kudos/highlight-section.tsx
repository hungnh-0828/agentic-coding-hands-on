"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";
import { KudosCard } from "./kudos-card";
import { KudosFilters } from "./kudos-filters";

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
          <div className="flex flex-col items-stretch gap-4">
            <KudosCard kudos={current} variant="highlight" />
            <div className="flex items-center justify-center gap-4 text-sm text-saa-muted">
              <button
                type="button"
                onClick={goPrev}
                disabled={safeIndex === 0}
                aria-label={tCard("carouselPrev")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-saa-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>
              <span className="tabular-nums">{safeIndex + 1}/{total}</span>
              <button
                type="button"
                onClick={goNext}
                disabled={safeIndex === total - 1}
                aria-label={tCard("carouselNext")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-saa-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-saa-muted">{t("empty")}</p>
        )}
      </div>
    </section>
  );
}
