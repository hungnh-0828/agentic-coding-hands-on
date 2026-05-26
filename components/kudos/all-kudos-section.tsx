"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";
import { KudosCard } from "./kudos-card";

export function AllKudosSection() {
  const t = useTranslations("kudos.allKudos");
  const { filteredKudos } = useKudosBoard();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-saa-muted">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-bold text-saa-accent sm:text-4xl">{t("title")}</h2>
      </header>
      <div className="mt-10 grid gap-6">
        {filteredKudos.length === 0 && (
          <p className="py-12 text-center text-saa-muted">{t("empty")}</p>
        )}
        {filteredKudos.map((k) => (
          <KudosCard key={k.id} kudos={k} variant="feed" />
        ))}
      </div>
    </section>
  );
}
