"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { KudosHashtag } from "@/lib/kudos/types";

type Props = {
  hashtags: KudosHashtag[];
  selected: string[];
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
};

export function HashtagPicker({ hashtags, selected, onAdd, onRemove }: Props) {
  const t = useTranslations("kudos.compose");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const available = hashtags.filter((h) => !selected.includes(h.slug));
  const atMax = selected.length >= 5;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-start gap-4">
      {/* Label */}
      <div className="flex shrink-0 items-center gap-0.5 pt-2">
        <span className="font-['Montserrat'] text-[22px] font-bold leading-[28px] text-[#00101A]">
          {t("hashtagLabel")}
        </span>
        <span className="font-['NotoSansJP'] text-[16px] font-bold leading-[20px] text-[#CF1322]">*</span>
      </div>

      {/* Chips + add button */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Selected chips */}
        {selected.map((slug) => {
          const hashtag = hashtags.find((h) => h.slug === slug);
          return (
            <span
              key={slug}
              className="flex items-center gap-1 rounded-[8px] border border-[#998C5F] bg-white px-2 py-1 font-['Montserrat'] text-[14px] font-semibold text-[#00101A]"
            >
              #{hashtag?.label ?? slug}
              <button
                type="button"
                aria-label={`Remove #${hashtag?.label ?? slug}`}
                onClick={() => onRemove(slug)}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[#999] hover:text-[#CF1322]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          );
        })}

        {/* Add button + dropdown — stacked label/note inside chip, matching design */}
        {!atMax && (
          <div ref={containerRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-[8px] border border-[#998C5F] bg-white px-3 py-[4px] hover:bg-[#FFF8E1]"
            >
              <span className="font-['Montserrat'] text-[14px] font-semibold text-[#00101A]">
                + {t("hashtagAdd")}
              </span>
              <span className="font-['Montserrat'] text-[11px] text-[#999]">{t("hashtagMax")}</span>
            </button>

            {open && available.length > 0 && (
              <ul className="absolute left-0 top-full z-50 mt-1 max-h-48 min-w-[160px] overflow-y-auto rounded-[8px] border border-[#998C5F] bg-white shadow-lg">
                {available.map((h) => (
                  <li
                    key={h.slug}
                    onMouseDown={() => {
                      onAdd(h.slug);
                      setOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2 hover:bg-[#FFF8E1] font-['Montserrat'] text-[14px] font-semibold text-[#00101A]"
                  >
                    #{h.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {atMax && (
          <span className="font-['Montserrat'] text-[12px] text-[#999]">{t("hashtagMax")}</span>
        )}
      </div>
    </div>
  );
}
