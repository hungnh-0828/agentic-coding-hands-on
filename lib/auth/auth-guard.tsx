"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/lib/i18n/navigation";
import { useMockAuth } from "@/lib/auth/mock-auth-context";

// Client-side route gate. Mock auth lives only on the client, so the gate runs there too.
// For real auth, swap with a middleware/server-side session check.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useMockAuth();
  const router = useRouter();
  const t = useTranslations("awardsInfo");

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24 text-center text-saa-muted">
        {t("redirectingToLogin")}
      </div>
    );
  }

  return <>{children}</>;
}
