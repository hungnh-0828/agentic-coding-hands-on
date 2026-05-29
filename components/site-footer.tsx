import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";

export function SiteFooter() {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  return (
    <footer className="mt-auto border-t border-white/5 bg-saa-bg-elev/40 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <Link href="/" aria-label="Sun* Annual Awards — Home" className="inline-flex">
          <Image
            src="/login/sun-annual-awards-logo.png"
            alt="Sun* Annual Awards"
            width={69}
            height={64}
            className="h-[56px] w-auto"
          />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link href="/about-saa-2025" className="text-saa-text/80 hover:text-saa-accent">
            {tNav("about")}
          </Link>
          <Link href="/awards-information" className="text-saa-text/80 hover:text-saa-accent">
            {tNav("awards")}
          </Link>
          <Link href="/sun-kudos" className="text-saa-text/80 hover:text-saa-accent">
            {tNav("kudos")}
          </Link>
          <Link href="/awards-information" className="text-saa-text/80 hover:text-saa-accent">
            {tFooter("standards")}
          </Link>
        </nav>
        <p className="text-xs text-saa-muted">{tFooter("copyright")}</p>
      </div>
    </footer>
  );
}
