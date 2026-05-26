import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SunKudosSection } from "@/components/sun-kudos-section";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

import { AwardsInformationBanner } from "@/components/awards-information/awards-information-banner";
import { AwardsInformationHeader } from "@/components/awards-information/awards-information-header";
import { AwardsInformationNav } from "@/components/awards-information/awards-information-nav";
import { AwardDetailBlock } from "@/components/awards-information/award-detail-block";

type AwardRow = Pick<
  Database["public"]["Tables"]["awards"]["Row"],
  "id" | "slug" | "title" | "description" | "display_order" | "prize_count" | "unit_label" | "prize_value"
>;

const FALLBACK: AwardRow[] = [
  { id: "1", slug: "top-talent",         title: "Top Talent",                 description: null, display_order: 1, prize_count: 10, unit_label: "Đơn vị",   prize_value: "7.000.000 VNĐ" },
  { id: "2", slug: "top-project",        title: "Top Project",                description: null, display_order: 2, prize_count: 2,  unit_label: "Tập thể",  prize_value: "15.000.000 VNĐ" },
  { id: "3", slug: "top-project-leader", title: "Top Project Leader",         description: null, display_order: 3, prize_count: 3,  unit_label: "Cá nhân",  prize_value: "7.000.000 VNĐ" },
  { id: "4", slug: "best-manager",       title: "Best Manager",               description: null, display_order: 4, prize_count: 1,  unit_label: "Cá nhân",  prize_value: "10.000.000 VNĐ" },
  { id: "5", slug: "signature-creator",  title: "Signature 2025 - Creator",   description: null, display_order: 5, prize_count: 1,  unit_label: null,       prize_value: "5.000.000 VNĐ (cá nhân)\n8.000.000 VNĐ (tập thể)" },
  { id: "6", slug: "mvp",                title: "MVP (Most Valuable Person)", description: null, display_order: 6, prize_count: 1,  unit_label: null,       prize_value: "15.000.000 VNĐ" },
];

async function fetchAwards(): Promise<AwardRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("awards")
      .select("id, slug, title, description, display_order, prize_count, unit_label, prize_value")
      .order("display_order", { ascending: true });
    if (error || !data?.length) return FALLBACK;
    return data;
  } catch {
    return FALLBACK;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "awardsInfo" });
  return { title: t("title") };
}

export default async function AwardsInformationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const awards = await fetchAwards();
  const navItems = awards.map((a) => ({ slug: a.slug, title: a.title }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <AuthGuard>
          <AwardsInformationBanner />
          <section className="mx-auto w-full max-w-7xl px-6 py-16">
            <AwardsInformationHeader />
            <div className="mt-12 grid gap-12 md:grid-cols-[220px_1fr]">
              <AwardsInformationNav items={navItems} />
              <div className="min-w-0">
                {awards.map((a) => (
                  <AwardDetailBlock
                    key={a.id}
                    slug={a.slug}
                    title={a.title}
                    description={a.description}
                    prizeCount={a.prize_count}
                    unitLabel={a.unit_label}
                    prizeValue={a.prize_value}
                  />
                ))}
              </div>
            </div>
          </section>
          <SunKudosSection />
        </AuthGuard>
      </main>
      <SiteFooter />
    </>
  );
}
