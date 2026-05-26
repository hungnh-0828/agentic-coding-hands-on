import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";

export function SunKudosSection() {
  const t = useTranslations("kudos");
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-24">
      <div className="grid gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-saa-bg-elev to-saa-bg p-10 ring-1 ring-white/5 md:grid-cols-2 md:p-16">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.4em] text-saa-accent">{t("label")}</p>
          <h2 className="mt-3 text-4xl font-bold text-saa-text sm:text-5xl">{t("title")}</h2>
          <p className="mt-6 max-w-md text-saa-muted">{t("description")}</p>
          <Link
            href="/sun-kudos"
            className="mt-8 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-saa-accent px-6 text-sm font-bold text-saa-bg hover:bg-saa-accent-soft"
          >
            {t("cta")}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div
          aria-hidden
          className="hidden h-full min-h-[260px] rounded-2xl bg-gradient-to-br from-saa-accent/30 via-saa-accent/5 to-transparent ring-1 ring-saa-border md:block"
        />
      </div>
    </section>
  );
}
