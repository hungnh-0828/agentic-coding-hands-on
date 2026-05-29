import Image from "next/image";
import { useTranslations } from "next-intl";

export function LoginHero() {
  const t = useTranslations("login");
  return (
    <div className="flex flex-col items-start text-left">
      <Image
        src="/login/root-further.png"
        alt="ROOT FURTHER"
        width={451}
        height={200}
        priority
        className="h-auto w-[280px] sm:w-[380px] md:w-[450px]"
      />
      <p className="mt-20 ml-4 max-w-[496px] text-sm font-semibold leading-7 text-white sm:text-base">
        {t("welcomeLine1")}
        <br />
        {t("welcomeLine2")}
      </p>
    </div>
  );
}
