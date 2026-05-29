import { useTranslations } from "next-intl";

export function EventInfo() {
  const t = useTranslations("hero.event");
  return (
    <div className="mt-8 space-y-2 text-sm text-saa-text">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
        <p>
          <span className="text-saa-muted">{t("timeLabel")} </span>
          <span className="font-semibold">{t("timeValue")}</span>
        </p>
        <p>
          <span className="text-saa-muted">{t("locationLabel")} </span>
          <span className="font-semibold">{t("locationValue")}</span>
        </p>
      </div>
      <p className="text-saa-muted">{t("broadcast")}</p>
    </div>
  );
}
