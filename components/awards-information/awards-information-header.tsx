import { useTranslations } from "next-intl";

export function AwardsInformationHeader() {
  const t = useTranslations("awardsInfo");
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-saa-muted">
        {t("caption")}
      </p>
      <h2 className="mt-3 text-3xl font-bold text-saa-accent sm:text-5xl">
        {t("title")}
      </h2>
    </div>
  );
}
