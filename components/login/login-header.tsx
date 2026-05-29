import Image from "next/image";

import { Link } from "@/lib/i18n/navigation";
import { LoginLanguageSwitcher } from "@/components/login/login-language-switcher";

// Minimal header for /login: Sun* Annual Awards logo (left) + flag-based language switcher (right).
// No nav, no notifications, no account menu — per design A.
export function LoginHeader({ locale }: { locale: string }) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-[#0B0F12]/80 shadow-[0_2px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="flex h-20 w-full items-center justify-between px-6 sm:px-10 lg:px-36">
        <Link href="/" aria-label="Sun* Annual Awards 2025 — Home" className="inline-flex">
          <Image
            src="/login/sun-annual-awards-logo.png"
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            priority
          />
        </Link>
        <LoginLanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
