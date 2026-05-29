import type { Metadata } from "next";
import Image from "next/image";
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
    <main className="relative isolate flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Root-pattern key visual fills the viewport (cover, no repeat). */}
      <Image
        src="/home/hero-bg.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {/* Semi-transparent dark cover keeps the text and digits readable. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-saa-bg/60" />
      <h1 className="mb-6 text-center font-montserrat text-3xl font-bold text-white sm:text-4xl">
        {t("title")}
      </h1>
      <CountdownTimer eventISO={eventISO} variant="led" />
    </main>
  );
}
