import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { LoginHeader } from "@/components/login/login-header";
import { LoginHero } from "@/components/login/login-hero";
import { LoginForm } from "@/components/login/login-form";
import { SiteFooter } from "@/components/site-footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "login" });
  return { title: t("title") };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LoginHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_40%,rgba(255,212,0,0.10),transparent_60%)]"
        />
        <div className="flex w-full max-w-3xl flex-col items-center">
          <LoginHero />
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
