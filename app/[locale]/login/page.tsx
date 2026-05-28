import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { LoginHeader } from "@/components/login/login-header";
import { LoginHero } from "@/components/login/login-hero";
import { LoginForm } from "@/components/login/login-form";

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

  const tFooter = await getTranslations({ locale, namespace: "footer" });

  return (
    <div className="relative isolate flex min-h-screen flex-col text-white">
      {/* Full-bleed keyvisual layered behind everything. The image bakes in some baked-on
          foreground (logo/headline/button) on its left half, so we mask the left band with
          a solid dark navy → transparent gradient. Live components sit in front of the mask. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/login/login-keyvisual.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#00101A_0%,#00101A_38%,rgba(0,16,26,0.85)_50%,rgba(0,16,26,0)_70%)]"
        />
      </div>

      <LoginHeader locale={locale} />

      <main className="relative flex flex-1 items-center px-10 pt-32 pb-24 md:px-20">
        <div className="flex w-full max-w-lg flex-col">
          <LoginHero />
          <LoginForm />
        </div>
      </main>

      <footer className="relative border-t border-white/5 py-6 text-center text-xs text-white/60">
        {tFooter("copyright")}
      </footer>
    </div>
  );
}
