import { useTranslations } from "next-intl";

export function RootFurtherContent() {
  const t = useTranslations("rootFurther");
  return (
    <section className="relative overflow-hidden border-y border-white/5 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-between px-8 text-[18vw] font-black leading-none text-white/[0.03] sm:text-[14vw]"
      >
        <span>ROOT</span>
        <span>FURTHER</span>
      </div>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-saa-accent">{t("caption")}</p>
        <p className="mt-6 text-base leading-relaxed text-saa-text/85 sm:text-lg">
          {t("body")}
        </p>
        <blockquote className="mt-8 italic text-saa-muted">
          &ldquo;{t("quote")}&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
