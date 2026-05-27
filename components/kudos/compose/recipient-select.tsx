"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { KudosPerson } from "@/lib/kudos/types";

type Props = {
  people: KudosPerson[];
  value: string;
  onChange: (id: string) => void;
};

export function RecipientSelect({ people, value, onChange }: Props) {
  const t = useTranslations("kudos.compose");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = people.find((p) => p.id === value) ?? null;

  const filtered = query.trim()
    ? people.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.departmentName ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : people;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(person: KudosPerson) {
    onChange(person.id);
    setQuery(person.name);
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (!e.target.value) onChange("");
    setOpen(true);
  }

  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div className="flex shrink-0 items-center gap-0.5">
        <span className="font-['Montserrat'] text-[22px] font-bold leading-[28px] text-[#00101A]">
          {t("recipientLabel")}
        </span>
        <span className="font-['NotoSansJP'] text-[16px] font-bold leading-[20px] text-[#CF1322]">*</span>
      </div>

      {/* Input + dropdown */}
      <div ref={containerRef} className="relative flex-1">
        <div
          className="flex items-center justify-between rounded-[8px] border border-[#998C5F] bg-white px-6 py-4"
          onClick={() => setOpen((v) => !v)}
        >
          <input
            type="text"
            value={selected && !open ? selected.name : query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder={t("recipientPlaceholder")}
            className="flex-1 bg-transparent font-['Montserrat'] text-[16px] font-bold leading-[24px] text-[#999] placeholder:text-[#999] outline-none"
          />
          {/* Down arrow icon — SVG inline */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 shrink-0 text-[#00101A]"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {open && filtered.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-[8px] border border-[#998C5F] bg-white shadow-lg">
            {filtered.map((p) => (
              <li
                key={p.id}
                onMouseDown={() => handleSelect(p)}
                className="cursor-pointer px-6 py-3 hover:bg-[#FFF8E1] font-['Montserrat'] text-[15px] font-semibold text-[#00101A]"
              >
                <span>{p.name}</span>
                {p.departmentName && (
                  <span className="ml-2 text-[13px] font-normal text-[#999]">{p.departmentName}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
