"use client";

import { useTranslations } from "next-intl";

import { LikeButton } from "./like-button";
import { CopyLinkButton } from "./copy-link-button";

import type { KudosPost } from "@/lib/kudos/types";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

function PersonBlock({ name, dept }: { name: string; dept: string | null }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-saa-accent/20 text-sm font-semibold text-saa-accent">
        {initial}
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-saa-text">{name}</p>
        {dept && <p className="text-xs text-saa-muted">{dept}</p>}
      </div>
    </div>
  );
}

export function KudosCard({ kudos, variant = "feed" }: { kudos: KudosPost; variant?: "feed" | "highlight" }) {
  const t = useTranslations("kudos.card");

  return (
    <article
      id={`kudos-${kudos.id}`}
      className={`flex flex-col gap-4 rounded-2xl border border-white/10 bg-saa-bg-elev p-5 ${
        variant === "highlight" ? "saa-card-glow" : ""
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PersonBlock name={kudos.sender.name} dept={kudos.sender.departmentName} />
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-saa-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <PersonBlock name={kudos.receiver.name} dept={kudos.receiver.departmentName} />
        </div>
        <time className="text-xs text-saa-muted">{formatTimestamp(kudos.createdAt)}</time>
      </header>
      <p className={`text-sm leading-relaxed text-saa-text/90 ${variant === "feed" ? "line-clamp-5" : "line-clamp-3"}`}>
        {kudos.content}
      </p>
      {kudos.hashtags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {kudos.hashtags.slice(0, 5).map((h) => (
            <li
              key={h.slug}
              className="rounded-full border border-saa-border bg-saa-accent/10 px-3 py-1 text-xs text-saa-accent"
            >
              #{h.label}
            </li>
          ))}
        </ul>
      )}
      <footer className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
        <LikeButton kudos={kudos} />
        <div className="flex items-center gap-4">
          <CopyLinkButton kudosId={kudos.id} />
          {variant === "highlight" && (
            <button type="button" className="text-sm text-saa-accent hover:underline">
              {t("viewDetail")}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
