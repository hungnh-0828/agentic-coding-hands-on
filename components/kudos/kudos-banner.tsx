import { useTranslations } from "next-intl";

export function KudosBanner() {
  const t = useTranslations("kudos.banner");
  return (
    <section
      aria-label={t("title")}
      className="relative isolate overflow-hidden border-b border-white/5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_20%,rgba(255,212,0,0.15),transparent_70%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-saa-accent">{t("eyebrow")}</p>
        <h1 className="mt-4 text-3xl font-bold text-saa-text sm:text-5xl">{t("title")}</h1>
      </div>
    </section>
  );
}
