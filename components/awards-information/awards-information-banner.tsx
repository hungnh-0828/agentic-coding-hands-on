import Image from "next/image";
import { useTranslations } from "next-intl";

export function AwardsInformationBanner() {
  const t = useTranslations("awardsInfo.banner");
  return (
    <section
      aria-label={`${t("title")} — ${t("subtitle")}`}
      className="relative isolate overflow-hidden border-b border-[#2e3940]"
    >
      {/* Root-pattern key visual — anchored right, fading into the dark page on the left. */}
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
        <Image
          src="/login/root-further.png"
          alt={t("title")}
          width={451}
          height={200}
          priority
          className="h-auto w-[260px] sm:w-[360px] md:w-[420px]"
        />
      </div>
    </section>
  );
}
