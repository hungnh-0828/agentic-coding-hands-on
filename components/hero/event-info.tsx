import { useTranslations } from "next-intl";

export function EventInfo() {
  const t = useTranslations("hero.event");
  return (
    <div className="mt-8 space-y-1 text-center text-sm text-saa-text/80">
      <p>
        <span className="text-saa-muted">{t("timeLabel")}</span> {t("timeValue")}
      </p>
      <p>
        <span className="text-saa-muted">{t("locationLabel")}</span> {t("locationValue")}
      </p>
      <p className="text-saa-muted">{t("broadcast")}</p>
    </div>
  );
}
