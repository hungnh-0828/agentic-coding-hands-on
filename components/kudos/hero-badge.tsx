"use client";

import { useTranslations } from "next-intl";

import type { HeroBadge } from "@/lib/kudos/hero-badge";

// New + Legend palettes are taken from the live-board design (navy / gold). Rising + Super
// only exist in separate hover frames (not on this screen); their gradients are tasteful
// escalating approximations — refine if those frames become available.
const TIER_STYLES: Record<HeroBadge, string> = {
  new: "bg-[#1c2436] text-white",
  rising: "bg-gradient-to-r from-[#5aa9e6] to-[#2f80ed] text-white",
  super: "bg-gradient-to-r from-[#9b6dff] to-[#6d3bff] text-white",
  legend: "bg-gradient-to-r from-[#ffd66b] to-[#e0a233] text-saa-ink",
};

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.09L2.5 9.27l6.6-1.01z" />
    </svg>
  );
}

export function HeroBadgePill({ badge }: { badge: HeroBadge }) {
  const t = useTranslations("kudos.badge");
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold leading-none ${TIER_STYLES[badge]}`}
    >
      {badge !== "new" && <StarIcon />}
      {t(badge)}
    </span>
  );
}
