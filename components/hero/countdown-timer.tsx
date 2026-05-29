"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { FALLBACK_EVENT_ISO } from "@/lib/event";

type Variant = "hero" | "led";
type Tone = "accent" | "light";
type Props = { eventISO: string; variant?: Variant; tone?: Tone };

function diff(now: number, target: number) {
  const ms = Math.max(0, target - now);
  const totalMin = Math.floor(ms / 60000);
  return {
    days: Math.floor(totalMin / (60 * 24)),
    hours: Math.floor((totalMin % (60 * 24)) / 60),
    minutes: totalMin % 60,
    expired: ms === 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownTimer({ eventISO, variant = "hero", tone = "accent" }: Props) {
  // Unit labels (DAYS/HOURS/MINUTES) are shared with the homepage hero — same i18n namespace.
  const t = useTranslations("hero.labels");
  const target = useMemo(() => {
    const ts = Date.parse(eventISO);
    return Number.isFinite(ts) ? ts : Date.parse(FALLBACK_EVENT_ISO);
  }, [eventISO]);

  // SSR renders placeholder ("--"); real countdown starts after hydration to avoid mismatch.
  const [tick, setTick] = useState<number | null>(null);

  useEffect(() => {
    setTick(Date.now());
    const id = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const ready = tick !== null;
  const { days, hours, minutes } = ready
    ? diff(tick, target)
    : { days: 0, hours: 0, minutes: 0 };

  const units = [
    { value: days, label: t("days") },
    { value: hours, label: t("hours") },
    { value: minutes, label: t("minutes") },
  ];

  if (variant === "led") {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-10">
        {units.map((unit) => {
          const display = ready ? pad(unit.value) : "--";
          return (
            <div
              key={unit.label}
              role="group"
              aria-label={`${display} ${unit.label}`}
              className="flex flex-col items-center"
            >
              <LedDigitPair value={display} tone={tone} />
              <span className="mt-4 text-sm font-bold uppercase tracking-[0.4em] text-saa-text">
                {unit.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Hero variant (default) — used on the homepage.
  return (
    <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="font-mono text-5xl font-bold text-saa-accent sm:text-7xl">
            {ready ? pad(unit.value) : "--"}
          </span>
          <span className="mt-1 text-xs tracking-[0.3em] text-saa-muted">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

// LED variant renders each digit in its own dark frame ("LED-style digit boxes" per design spec).
// Caller must pass a 2-character string ("00".."99" or "--"); we do not pad here.
function LedDigitPair({ value, tone = "accent" }: { value: string; tone?: Tone }) {
  const [tens, ones] = value.split("");
  const box =
    tone === "light"
      ? "border-white/15 bg-white/5 text-white"
      : "border-saa-border bg-saa-bg-elev text-saa-accent";
  return (
    <div className="flex gap-2" aria-hidden>
      {([
        { key: "tens", digit: tens },
        { key: "ones", digit: ones },
      ] as const).map(({ key, digit }) => (
        <span
          key={key}
          className={`inline-flex h-20 w-16 items-center justify-center rounded-lg border font-mono text-5xl font-bold shadow-inner sm:h-24 sm:w-[72px] sm:text-6xl ${box}`}
        >
          {digit}
        </span>
      ))}
    </div>
  );
}
