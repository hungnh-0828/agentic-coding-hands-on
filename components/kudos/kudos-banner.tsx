import Image from "next/image";
import { useTranslations } from "next-intl";

export function KudosBanner() {
  const t = useTranslations("kudos.banner");
  return (
    <section className="relative isolate overflow-hidden border-b border-white/5">
      <Image
        src="/home/kudos-bg.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        priority
        className="-z-10 object-cover"
      />
      {/* Left-to-right scrim keeps the title/logo legible over the decorative artwork. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-saa-bg via-saa-bg/70 to-transparent"
      />
      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-24">
        <p className="text-base font-semibold text-saa-text sm:text-xl">{t("title")}</p>
        <Image
          src="/home/kudos-logo.svg"
          alt="Sun* Kudos"
          width={420}
          height={86}
          priority
          className="mt-4 h-auto w-[240px] sm:w-[420px]"
        />
      </div>
    </section>
  );
}
