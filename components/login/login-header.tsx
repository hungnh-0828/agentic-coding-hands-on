import { Link } from "@/lib/i18n/navigation";
import { LanguageSwitcher } from "@/components/header/language-switcher";

// Minimal header for /login: only logo + language switcher (no nav, no account, no notifications).
export function LoginHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="Sun* Annual Awards — Home">
          <span className="inline-flex h-[60px] w-16 items-center justify-center rounded bg-saa-accent text-sm font-black text-saa-bg">
            SAA
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
