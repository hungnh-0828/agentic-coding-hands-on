"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

// Deterministic pseudo-random value for each name so positions stay stable across renders.
function hashOffset(seed: string, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % max;
}

export function SpotlightBoard() {
  const t = useTranslations("kudos.spotlight");
  const tEmpty = useTranslations("kudos.allKudos");
  const { totalKudos, receiverNames } = useKudosBoard();

  // Scatter names across the canvas with stable positions, sizes and opacities.
  const items = useMemo(
    () =>
      receiverNames.map((name) => ({
        name,
        top: 8 + hashOffset(name + "t", 80),       // 8%–88%
        left: 4 + hashOffset(name + "l", 88),      // 4%–92%
        size: 13 + hashOffset(name, 14),           // 13–27px
        opacity: 0.25 + hashOffset(name + "o", 45) / 100,
      })),
    [receiverNames],
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-saa-muted">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-bold text-saa-accent sm:text-4xl">{t("title")}</h2>
      </header>

      <div className="relative mt-10 h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#05070b]">
        {/* Decorative colored glow on the left edge (matches the artwork in the design). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 h-[120%] w-72 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,#ff5d73,#ffd400,#36d1a0,#5aa9e6,#ff5d73)] opacity-40 blur-3xl"
        />

        {/* Scattered receiver names. */}
        {items.map((item) => (
          <span
            key={item.name}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-saa-text"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
            }}
          >
            {item.name}
          </span>
        ))}

        {/* Centered total count. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="rounded-2xl bg-black/30 px-8 py-4 text-4xl font-extrabold text-saa-text backdrop-blur-sm sm:text-5xl">
            {t("total", { count: totalKudos })}
          </p>
        </div>

        {items.length === 0 && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-saa-muted">{tEmpty("empty")}</p>
        )}

        {/* Expand affordance (pan/zoom is out of scope this iteration). */}
        <span
          aria-hidden
          className="absolute bottom-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-saa-muted"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </span>
      </div>
    </section>
  );
}
