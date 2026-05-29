import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = {
  slug: string;
  title: string;
  description: string | null;
  prizeCount: number | null;
  unitLabel: string | null;
  prizeValue: string | null;
  orbSrc: string;
  /** When true the orb sits on the right (alternating layout per Figma). */
  flip?: boolean;
};

// 24px gold line icons matching the Figma design item glyphs (Target / Diamond / License).
function TargetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-saa-accent-soft">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
    </svg>
  );
}
function DiamondIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-saa-accent-soft">
      <path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M9 3l-3 6 6 12M15 3l3 6-6 12" />
    </svg>
  );
}
function AwardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-saa-accent-soft">
      <circle cx="12" cy="8" r="6" /><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </svg>
  );
}

export function AwardDetailBlock({
  slug,
  title,
  description,
  prizeCount,
  unitLabel,
  prizeValue,
  orbSrc,
  flip,
}: Props) {
  const t = useTranslations("awardsInfo");
  // scroll-margin offsets the sticky header so hash links land below it.
  return (
    <article id={slug} className="scroll-mt-28 border-b border-[#2e3940] py-16 last:border-b-0">
      <div
        className={`flex flex-col gap-10 md:items-start ${flip ? "md:flex-row-reverse" : "md:flex-row"}`}
      >
        {/* Award orb — name, glow and pedestal are baked into the PNG. */}
        <div className="shrink-0">
          <Image
            src={orbSrc}
            alt={title}
            width={336}
            height={336}
            className="h-auto w-full max-w-[336px] rounded-3xl"
            style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 24px rgba(250,226,135,0.45)" }}
          />
        </div>

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <TargetIcon />
              <h3 className="text-2xl font-bold text-saa-accent-soft">{title}</h3>
            </div>
            {description && (
              <p className="text-justify text-base leading-6 tracking-[0.5px] text-white">
                {description}
              </p>
            )}
          </div>

          {prizeCount !== null && (
            <>
              <div className="h-px w-full bg-[#2e3940]" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <DiamondIcon />
                <span className="text-2xl font-bold text-saa-accent-soft">{t("prizeCountLabel")}</span>
                <span className="text-4xl font-bold leading-none text-white">
                  {String(prizeCount).padStart(2, "0")}
                </span>
                {unitLabel && <span className="text-sm text-white">{unitLabel}</span>}
              </div>
            </>
          )}

          {prizeValue && (
            <>
              <div className="h-px w-full bg-[#2e3940]" />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <AwardIcon />
                  <span className="text-2xl font-bold text-saa-accent-soft">{t("prizeValueLabel")}</span>
                </div>
                <p className="whitespace-pre-line text-4xl font-bold leading-tight text-white">
                  {prizeValue}
                </p>
                <p className="text-sm text-white/90">{t("perPrize")}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
