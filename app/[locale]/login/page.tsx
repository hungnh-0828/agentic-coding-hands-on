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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#00101A] text-white">
      {/* Full-bleed keyvisual — spans the FULL viewport width (not capped to the content frame).
          Sized to its native 1440×1024 and scaled to 100% width so it grows with the screen
          edge-to-edge at its natural proportions (no object-cover over-zoom). The navy page
          background fills any area below the image on very tall viewports.
          NOTE: this PNG is a flattened export of the whole screen — the headline/text/button are
          baked onto its left ~46%, and the clean background-only art is not retrievable via the
          MoMorph MCP. So the live components must cover that band: the navy left-mask stays opaque
          across the baked foreground, then fades over the art. The bottom gradient darkens the
          lower band for readability (design Cover layer). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/login/login-keyvisual.png"
          alt=""
          width={1440}
          height={1024}
          priority
          sizes="100vw"
          className="absolute inset-x-0 top-0 h-auto w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#00101A_0%,#00101A_46%,rgba(0,16,26,0.6)_58%,rgba(0,16,26,0)_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#00101A_22.48%,rgba(0,19,32,0)_51.74%)]" />
      </div>

      {/* Content frame — constrained to the 1440 design width and centered. */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col">
        <LoginHeader locale={locale} />

        <main className="relative flex flex-1 flex-col items-start justify-center px-6 sm:px-10 lg:px-36">
          <LoginHero />
          <LoginForm />
        </main>

        <footer className="relative py-6 text-center text-xs text-white/60">
          {tFooter("copyright")}
        </footer>
      </div>
    </div>
  );
}
