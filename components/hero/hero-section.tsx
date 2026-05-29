import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";
import { getEventISO } from "@/lib/event";

import { CountdownTimer } from "./countdown-timer";
import { EventInfo } from "./event-info";

export function HeroSection() {
  const t = useTranslations("hero");
  const eventISO = getEventISO();

  const isFuture = Date.parse(eventISO) > Date.now();

  return (
    <section className="relative isolate overflow-hidden">
      {/* Root-pattern key visual — anchored to the right, fades into the dark page on the left. */}
      <Image
        src="/home/hero-bg.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-right"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-saa-bg via-saa-bg/85 to-saa-bg/20"
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-28">
        <div className="max-w-2xl">
          <Image
            src="/login/root-further.png"
            alt={t("title")}
            width={451}
            height={200}
            priority
            className="h-auto w-[260px] sm:w-[360px] md:w-[420px]"
          />

          {isFuture && (
            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-saa-muted">
              {t("comingSoon")}
            </p>
          )}

          <div className="mt-8">
            <div className="flex justify-start">
              <CountdownTimer eventISO={eventISO} variant="led" tone="light" />
            </div>
          </div>

          <EventInfo />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/awards-information"
              className="inline-flex h-12 items-center justify-center rounded-full bg-saa-accent-soft px-7 text-sm font-bold uppercase tracking-wider text-saa-bg hover:bg-saa-accent"
            >
              {t("ctaAwards")}
            </Link>
            <Link
              href="/sun-kudos"
              className="inline-flex h-12 items-center justify-center rounded-full border border-saa-accent-soft px-7 text-sm font-bold uppercase tracking-wider text-saa-accent-soft hover:bg-saa-accent-soft hover:text-saa-bg"
            >
              {t("ctaKudos")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
