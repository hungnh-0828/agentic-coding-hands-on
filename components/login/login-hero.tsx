import { useTranslations } from "next-intl";

export function LoginHero() {
  const t = useTranslations("login");
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-black tracking-tight">
        <span className="block bg-gradient-to-b from-white to-saa-text/60 bg-clip-text text-5xl text-transparent sm:text-7xl md:text-8xl">
          ROOT FURTHER
        </span>
      </h1>
      <p className="mt-6 max-w-md text-base text-saa-text/85 sm:text-lg">
        {t("welcomeLine1")}
        <br />
        {t("welcomeLine2")}
      </p>
    </div>
  );
}
