import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";

import { CountdownTimer } from "./countdown-timer";
import { EventInfo } from "./event-info";

export function HeroSection() {
  const t = useTranslations("hero");
  const eventISO =
    process.env.NEXT_PUBLIC_EVENT_DATETIME ?? "2025-12-31T18:30:00+07:00";

  const isFuture = Date.parse(eventISO) > Date.now();

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,212,0,0.10),transparent_60%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-16 pt-20 sm:pt-32">
        <h1 className="text-center font-black tracking-tight text-saa-text">
          <span className="block bg-gradient-to-b from-white to-saa-text/60 bg-clip-text text-5xl text-transparent sm:text-7xl md:text-8xl">
            {t("title")}
          </span>
        </h1>
        {isFuture && (
          <p className="mt-4 text-sm uppercase tracking-[0.4em] text-saa-muted">
            {t("comingSoon")}
          </p>
        )}

        <div className="mt-12 w-full">
          <CountdownTimer eventISO={eventISO} />
        </div>

        <EventInfo />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/awards-information"
            className="inline-flex h-12 items-center justify-center rounded-full bg-saa-accent px-7 text-sm font-bold uppercase tracking-wider text-saa-bg hover:bg-saa-accent-soft"
          >
            {t("ctaAwards")}
          </Link>
          <Link
            href="/sun-kudos"
            className="inline-flex h-12 items-center justify-center rounded-full border border-saa-accent px-7 text-sm font-bold uppercase tracking-wider text-saa-accent hover:bg-saa-accent hover:text-saa-bg"
          >
            {t("ctaKudos")}
          </Link>
        </div>
      </div>
    </section>
  );
}
