"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Props = { eventISO: string };

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

export function CountdownTimer({ eventISO }: Props) {
  const t = useTranslations("hero.labels");
  const target = useMemo(() => {
    const ts = Date.parse(eventISO);
    return Number.isFinite(ts) ? ts : Date.parse("2025-12-31T18:30:00+07:00");
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

  return (
    <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
      {[
        { value: days, label: t("days") },
        { value: hours, label: t("hours") },
        { value: minutes, label: t("minutes") },
      ].map((unit) => (
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
