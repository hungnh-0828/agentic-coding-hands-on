import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { CountdownTimer } from "@/components/hero/countdown-timer";
import { getEventISO } from "@/lib/event";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prelaunch" });
  return { title: t("title") };
}

export default async function PrelaunchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prelaunch");

  const eventISO = getEventISO();

  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_30%,rgba(255,212,0,0.10),transparent_60%)]"
      />
      <h1 className="mb-12 text-center text-2xl font-semibold text-saa-text sm:text-3xl">
        {t("title")}
      </h1>
      <CountdownTimer eventISO={eventISO} variant="led" />
    </main>
  );
}
