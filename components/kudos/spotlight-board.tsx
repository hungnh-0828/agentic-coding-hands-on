"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

// Deterministic pseudo-random offset for each name so positions stay stable across renders.
function hashOffset(seed: string, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % max;
}

export function SpotlightBoard() {
  const t = useTranslations("kudos.spotlight");
  const tEmpty = useTranslations("kudos.allKudos");
  const { totalKudos, receiverNames } = useKudosBoard();

  // Build a simple word-cloud-ish list with varying font sizes.
  const items = useMemo(
    () =>
      receiverNames.map((name) => ({
        name,
        size: 14 + (hashOffset(name, 20)),     // 14-33px
        rotate: hashOffset(name + "r", 11) - 5, // -5..+5deg
        opacity: 0.5 + hashOffset(name + "o", 50) / 100,
      })),
    [receiverNames],
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-saa-muted">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-bold text-saa-accent sm:text-4xl">{t("title")}</h2>
      </header>
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-saa-bg-elev/40 p-10">
        <p className="mb-6 text-center text-2xl font-bold text-saa-accent">
          {t("total", { count: totalKudos })}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {items.length === 0 ? (
            <p className="text-saa-muted">{tEmpty("empty")}</p>
          ) : (
            items.map((item) => (
              <span
                key={item.name}
                className="text-saa-text"
                style={{
                  fontSize: `${item.size}px`,
                  transform: `rotate(${item.rotate}deg)`,
                  opacity: item.opacity,
                }}
              >
                {item.name}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
