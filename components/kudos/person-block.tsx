import Image from "next/image";

import { HeroBadgePill } from "./hero-badge";

import type { HeroBadge } from "@/lib/kudos/hero-badge";

type PersonBlockProps = {
  name: string;
  dept: string | null;
  avatarUrl: string | null;
  badge: HeroBadge | null;
  align?: "left" | "right";
  size?: number;
};

// Vertical person block used in kudos cards: avatar on top, name, then "DEPT • badge".
// `align` mirrors the layout so the sender reads left-aligned and the receiver right-aligned.
export function PersonBlock({
  name,
  dept,
  avatarUrl,
  badge,
  align = "left",
  size = 56,
}: PersonBlockProps) {
  const alignClass = align === "right" ? "items-end text-right" : "items-start text-left";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${alignClass}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover ring-2 ring-white"
          style={{ width: size, height: size }}
        />
      ) : (
        <span
          className="inline-flex items-center justify-center rounded-full bg-saa-ink/10 font-semibold text-saa-ink ring-2 ring-white"
          style={{ width: size, height: size }}
        >
          {initial}
        </span>
      )}
      <p className="max-w-full truncate text-sm font-bold text-saa-ink">{name}</p>
      <div className={`flex flex-wrap items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
        {dept && <span className="text-xs font-medium text-saa-ink-soft">{dept}</span>}
        {dept && badge && <span className="text-saa-ink-soft">•</span>}
        {badge && <HeroBadgePill badge={badge} />}
      </div>
    </div>
  );
}
