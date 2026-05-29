"use client";

import Image from "next/image";
import { useState } from "react";

import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

// Flag asset per locale.
const FLAG_SRC: Record<string, string> = {
  vi: "/login/flag-vn.svg",
  en: "/login/flag-en.svg",
};

export function LoginLanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchTo = (next: (typeof routing.locales)[number]) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-sm font-semibold text-white hover:bg-white/5"
      >
        <Image src={FLAG_SRC[locale] ?? FLAG_SRC.vi} alt="" width={24} height={24} aria-hidden />
        <span>{locale.toUpperCase()}</span>
        <Image src="/login/chevron-down.svg" alt="" width={16} height={16} aria-hidden />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 mt-1 min-w-[7rem] overflow-hidden rounded-sm border border-white/10 bg-[#101417] text-sm shadow-lg"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="none">
              <button
                role="menuitem"
                type="button"
                onClick={() => switchTo(loc)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-white hover:bg-white/5"
              >
                <Image src={FLAG_SRC[loc] ?? FLAG_SRC.vi} alt="" width={20} height={20} aria-hidden />
                {loc.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
