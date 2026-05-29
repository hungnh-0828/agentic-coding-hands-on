import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n/routing";
import { MockAuthProvider } from "@/lib/auth/mock-auth-context";

import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025 — ROOT FURTHER",
  description: "Sun* Annual Awards 2025: tôn vinh những cá nhân và đội nhóm xuất sắc.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-saa-bg text-saa-text">
        <NextIntlClientProvider messages={messages}>
          <MockAuthProvider>{children}</MockAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
