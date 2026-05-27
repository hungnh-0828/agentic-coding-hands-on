"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

type ToolbarKey = "bold" | "italic" | "strikethrough" | "number" | "link" | "quote";

const TOOLBAR_BUTTONS: { key: ToolbarKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "bold",
    label: "Bold",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4h8a4 4 0 010 8H6V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 12h9a4 4 0 010 8H6V12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "italic",
    label: "Italic",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4h6M7 20h6M14 4l-4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "strikethrough",
    label: "Strikethrough",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M9 6c0-1.1.9-2 2-2h2a2 2 0 012 2v1H9V6zM7 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "number",
    label: "Numbered list",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "link",
    label: "Link",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "quote",
    label: "Quote",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="2" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export function KudoEditor({ value, onChange }: Props) {
  const t = useTranslations("kudos.compose");
  const [activeTools, setActiveTools] = useState<Set<ToolbarKey>>(new Set());

  function toggleTool(key: ToolbarKey) {
    setActiveTools((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center border border-[#998C5F]">
        {/* Format buttons */}
        <div className="flex">
          {TOOLBAR_BUTTONS.map((btn, idx) => {
            const isFirst = idx === 0;
            const isActive = activeTools.has(btn.key);
            return (
              <button
                key={btn.key}
                type="button"
                aria-label={btn.label}
                aria-pressed={isActive}
                onClick={() => toggleTool(btn.key)}
                className={[
                  "flex h-[40px] w-[56px] items-center justify-center border-[#998C5F] px-[16px] py-[10px] transition-colors",
                  isFirst ? "rounded-tl-[8px]" : "",
                  "border-r",
                  isActive
                    ? "bg-[#FFEA9E] text-[#00101A]"
                    : "bg-transparent text-[#00101A] hover:bg-[#FFF8E1]",
                ].join(" ")}
              >
                {btn.icon}
              </button>
            );
          })}
        </div>

        {/* Community standards link — fills remaining space */}
        <div className="flex flex-1 items-center justify-end rounded-tr-[8px] border-[#998C5F] px-[16px] py-[10px]">
          <a
            href="#"
            className="font-['Montserrat'] text-[16px] font-bold leading-[24px] text-[#E46060] underline-offset-2 hover:underline"
          >
            {t("communityStandards")}
          </a>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("editorPlaceholder")}
        rows={8}
        className="min-h-[200px] w-full resize-y rounded-bl-[8px] rounded-br-[8px] border border-t-0 border-[#998C5F] bg-white px-6 py-4 font-['Montserrat'] text-[16px] font-bold leading-[24px] text-[#00101A] placeholder:font-bold placeholder:text-[#999] outline-none"
      />

      {/* Hint */}
      <p className="mt-1 text-right font-['Montserrat'] text-[16px] font-bold leading-[24px] tracking-[0.5px] text-[#00101A]">
        {t("editorMentionHint")}
      </p>
    </div>
  );
}
