import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { fetchKudosBoard, fetchKudosStats } from "@/lib/kudos/queries";

import { KudosBoardProvider } from "@/components/kudos/kudos-board-context";
import { ComposeModalProvider } from "@/components/kudos/compose/compose-modal-context";
import { ComposeKudoModal } from "@/components/kudos/compose/compose-kudo-modal";
import { KudosBanner } from "@/components/kudos/kudos-banner";
import { SendKudosInput } from "@/components/kudos/send-kudos-input";
import { HighlightSection } from "@/components/kudos/highlight-section";
import { SpotlightBoard } from "@/components/kudos/spotlight-board";
import { AllKudosSection } from "@/components/kudos/all-kudos-section";
import { KudosSidebar } from "@/components/kudos/kudos-sidebar";
import { KudosToast } from "@/components/kudos/kudos-toast";

// TODO(auth): replace with session.user.id once real Supabase Auth lands.
// For now sidebar stats always show the demo regular user.
const DEMO_STATS_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kudos.banner" });
  return { title: t("title") };
}

export default async function SunKudosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [board, stats] = await Promise.all([
    fetchKudosBoard(),
    fetchKudosStats(DEMO_STATS_USER_ID),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <AuthGuard>
          <KudosBoardProvider data={board}>
            <ComposeModalProvider>
              <KudosBanner />
              <div className="mx-auto w-full max-w-6xl px-6 pt-12">
                <SendKudosInput />
              </div>
              <HighlightSection />
              <SpotlightBoard />
              <div className="mx-auto w-full max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                  <AllKudosSection />
                  <div className="lg:pt-16">
                    <KudosSidebar stats={stats} />
                  </div>
                </div>
              </div>
              <KudosToast />
              {/* Compose modal: recipient list excludes the demo sender (sender_not_receiver). */}
              <ComposeKudoModal
                people={board.people.filter((p) => p.id !== DEMO_STATS_USER_ID)}
                hashtags={board.hashtags}
              />
            </ComposeModalProvider>
          </KudosBoardProvider>
        </AuthGuard>
      </main>
      <SiteFooter />
    </>
  );
}
