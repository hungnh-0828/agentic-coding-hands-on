import { useTranslations } from "next-intl";

export function AwardsInformationBanner() {
  const t = useTranslations("awardsInfo.banner");
  return (
    <section
      aria-label={`${t("title")} — ${t("subtitle")}`}
      className="relative isolate overflow-hidden border-b border-white/5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(255,212,0,0.15),transparent_70%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center">
        <h1 className="font-black tracking-tight">
          <span className="block bg-gradient-to-b from-white to-saa-text/60 bg-clip-text text-5xl text-transparent sm:text-7xl">
            {t("title")}
          </span>
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.4em] text-saa-accent">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}
