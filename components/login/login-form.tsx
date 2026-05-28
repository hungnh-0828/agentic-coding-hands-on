"use client";

import Image from "next/image";
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
    }, MOCK_OAUTH_DELAY_MS);
  };

  if (isAuthenticated) {
    return (
      <p role="status" className="mt-10 text-sm text-white/70">
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
      className="mt-10 inline-flex h-14 min-w-[280px] items-center justify-between gap-3 rounded-sm bg-[#FFEA9E] px-7 text-base font-semibold text-[#00101A] shadow-md transition hover:bg-[#FFF8E1] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="flex-1 text-left tracking-wide">
        {loading ? t("loading") : t("googleCta")}
      </span>
      {loading ? <Spinner /> : <Image src="/login/google-g.svg" alt="" width={24} height={24} aria-hidden />}
    </button>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
