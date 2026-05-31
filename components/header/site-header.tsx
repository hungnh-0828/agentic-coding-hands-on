import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

import { NavLink } from "./nav-link";
import { NotificationBell } from "./notification-bell";
import { LanguageSwitcher } from "./language-switcher";
import { AccountMenu } from "./account-menu";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

async function getUnreadCount() {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", MOCK_USER_ID)
      .is("read_at", null);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const unreadCount = await getUnreadCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-saa-bg/85 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Sun* Annual Awards — Home" className="inline-flex">
            <Image
              src="/login/sun-annual-awards-logo.png"
              alt="Sun* Annual Awards"
              width={64}
              height={60}
              priority
              className="h-[60px] w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="/">{t("about")}</NavLink>
            <NavLink href="/awards-information">{t("awards")}</NavLink>
            <NavLink href="/sun-kudos">{t("kudos")}</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell unreadCount={unreadCount} />
          <LanguageSwitcher />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
