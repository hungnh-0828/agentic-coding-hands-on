import { useTranslations } from "next-intl";

type Props = {
  slug: string;
  title: string;
  description: string | null;
  prizeCount: number | null;
  unitLabel: string | null;
  prizeValue: string | null;
};

export function AwardDetailBlock({
  slug,
  title,
  description,
  prizeCount,
  unitLabel,
  prizeValue,
}: Props) {
  const t = useTranslations("awardsInfo");
  // scroll-margin offsets the sticky header so hash links land below it.
  return (
    <article
      id={slug}
      className="grid scroll-mt-28 gap-10 border-b border-white/5 py-16 md:grid-cols-[336px_1fr] md:gap-12"
    >
      <div
        aria-hidden
        className="aspect-square w-full max-w-[336px] rounded-2xl bg-gradient-to-br from-saa-accent/30 via-saa-accent/10 to-transparent ring-1 ring-saa-border"
      />
      <div className="flex flex-col">
        <h3 className="text-3xl font-bold text-saa-accent sm:text-4xl">{title}</h3>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-saa-text/85">{description}</p>
        )}
        <dl className="mt-8 space-y-2 text-sm">
          {prizeCount !== null && (
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="text-saa-muted">{t("prizeCountLabel")}</dt>
              <dd className="font-semibold text-saa-text">
                {String(prizeCount).padStart(2, "0")}
                {unitLabel && <span className="ml-2 font-normal text-saa-muted">{unitLabel}</span>}
              </dd>
            </div>
          )}
          {prizeValue && (
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="text-saa-muted">{t("prizeValueLabel")}</dt>
              <dd className="whitespace-pre-line font-semibold text-saa-text">
                {prizeValue}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
