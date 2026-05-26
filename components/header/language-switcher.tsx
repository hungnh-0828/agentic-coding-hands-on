"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);

  const switchTo = (locale: (typeof routing.locales)[number]) => {
    setOpen(false);
    router.replace(pathname, { locale });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center justify-center rounded px-3 text-sm font-semibold text-saa-text hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {t("language")}
      </button>
      {open && (
        <ul role="menu" className="absolute right-0 mt-1 min-w-[6rem] overflow-hidden rounded border border-white/10 bg-saa-bg-elev text-sm">
          {routing.locales.map((loc) => (
            <li key={loc} role="none">
              <button
                role="menuitem"
                type="button"
                onClick={() => switchTo(loc)}
                className="block w-full px-4 py-2 text-left hover:bg-white/5"
              >
                {loc.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
