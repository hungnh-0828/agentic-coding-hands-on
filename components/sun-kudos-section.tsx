import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";

export function SunKudosSection() {
  const t = useTranslations("kudosSection");
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
      <div className="relative isolate overflow-hidden rounded-3xl">
        <Image
          src="/home/kudos-bg.png"
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1280px) 100vw, 1216px"
          className="-z-10 object-cover"
        />
        <div className="grid items-center gap-8 p-8 sm:p-12 md:grid-cols-2 md:p-16">
          <div className="flex flex-col">
            <p className="text-lg font-bold text-saa-text">{t("label")}</p>
            <h2 className="mt-2 text-4xl font-extrabold text-saa-accent-soft sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-saa-accent">
              {t("eyebrow")}
            </p>
            <p className="mt-2 max-w-md text-justify text-sm leading-relaxed text-saa-text/85">
              {t("description")}
            </p>
            <Link
              href="/sun-kudos"
              className="mt-8 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-saa-accent-soft px-6 text-sm font-bold text-saa-bg hover:bg-saa-accent"
            >
              {t("cta")}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7v8" />
              </svg>
            </Link>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <Image
              src="/home/kudos-logo.svg"
              alt="Sun* Kudos"
              width={364}
              height={74}
              className="h-auto w-[240px] sm:w-[320px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
