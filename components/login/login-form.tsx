"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/lib/i18n/navigation";
import { useMockAuth } from "@/lib/auth/mock-auth-context";

const MOCK_OAUTH_DELAY_MS = 800;

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const { isAuthenticated, signIn } = useMockAuth();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Already-authed users are bounced to the home page.
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  // Clear any in-flight mock-OAuth timer if the user navigates away mid-flow.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const handleGoogleSignIn = () => {
    if (loading) return;
    setLoading(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      signIn("regular");
      // The useEffect above will redirect once isAuthenticated flips to true.
    }, MOCK_OAUTH_DELAY_MS);
  };

  if (isAuthenticated) {
    return (
      <p role="status" className="mt-10 text-sm text-saa-muted">
        {t("alreadyAuthed")}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      aria-busy={loading}
      className="mt-10 inline-flex h-12 min-w-[280px] items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-saa-bg shadow-md transition hover:shadow-xl hover:shadow-saa-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Spinner />
          <span>{t("loading")}</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span>{t("googleCta")}</span>
        </>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09a6.59 6.59 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
