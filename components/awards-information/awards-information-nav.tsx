"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type NavItem = { slug: string; title: string };

// Sticky left nav with scroll-spy + URL hash sync.
// IntersectionObserver watches section ids; the most-intersecting section wins.
export function AwardsInformationNav({ items }: { items: NavItem[] }) {
  const t = useTranslations("awardsInfo");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const isManualScroll = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending isManualScroll reset on unmount.
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // Seed active slug from URL hash on mount (deep-link support).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && items.some((i) => i.slug === hash)) {
      setActiveSlug(hash);
    } else if (items[0]) {
      setActiveSlug(items[0].slug);
    }
  }, [items]);

  useEffect(() => {
    const elements = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll.current) return;
        // Pick the entry with the highest intersection ratio that is currently intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) setActiveSlug(top.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.1, 0.25, 0.5, 0.75] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (slug: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(slug);
    if (!target) return;
    isManualScroll.current = true;
    setActiveSlug(slug);
    window.history.replaceState(null, "", `#${slug}`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Cancel any prior scroll-release timer so rapid clicks don't release early.
    if (scrollTimerRef.current !== null) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isManualScroll.current = false;
      scrollTimerRef.current = null;
    }, 800);
  };

  return (
    <nav aria-label={t("navAria")} className="md:sticky md:top-28">
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                onClick={handleClick(item.slug)}
                aria-current={isActive ? "location" : undefined}
                className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-saa-accent underline decoration-saa-accent decoration-2 underline-offset-8"
                    : "text-saa-text/85 hover:bg-white/5 hover:text-saa-accent"
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
