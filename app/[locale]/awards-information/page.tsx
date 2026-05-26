import { setRequestLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AwardsInformationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-6 py-24 text-center">
        <h1 className="text-4xl font-bold text-saa-accent">{tNav("awards")}</h1>
        <p className="mt-4 text-saa-muted">{tCommon("comingSoon")}</p>
      </main>
      <SiteFooter />
    </>
  );
}
