import { useTranslations } from "next-intl";

export function AwardsInformationHeader() {
  const t = useTranslations("awardsInfo");
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-2xl font-bold text-white">{t("caption")}</p>
      <div className="h-px w-full bg-[#2e3940]" />
      <h2 className="text-center text-4xl font-bold tracking-tight text-saa-accent-soft sm:text-5xl lg:text-[57px] lg:leading-[64px]">
        {t("title")}
      </h2>
    </div>
  );
}
