import { setRequestLocale } from "next-intl/server";

import { SiteHeader } from "@/components/header/site-header";
import { HeroSection } from "@/components/hero/hero-section";
import { RootFurtherContent } from "@/components/root-further-content";
import { AwardsSection } from "@/components/awards/awards-section";
import { SunKudosSection } from "@/components/sun-kudos-section";
import { SiteFooter } from "@/components/site-footer";
import { WidgetButton } from "@/components/widget-button";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <RootFurtherContent />
        <AwardsSection />
        <SunKudosSection />
      </main>
      <SiteFooter />
      <WidgetButton />
    </>
  );
}
