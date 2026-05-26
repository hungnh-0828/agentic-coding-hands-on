"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

type DropdownProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  allLabel: string;
};

function Dropdown<T extends string>({ label, options, value, onChange, allLabel }: DropdownProps<T>) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-saa-bg-elev/70 px-4 py-2 text-sm">
      <span className="text-saa-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : (e.target.value as T))}
        className="cursor-pointer bg-transparent text-saa-text outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-saa-bg-elev">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function KudosFilters() {
  const t = useTranslations("kudos.filters");
  const board = useKudosBoard();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown
        label={t("hashtag")}
        allLabel={t("all")}
        value={board.selectedHashtag}
        onChange={board.setSelectedHashtag}
        options={board.hashtags.map((h) => ({ value: h.slug, label: h.label }))}
      />
      <Dropdown
        label={t("department")}
        allLabel={t("all")}
        value={board.selectedDept}
        onChange={board.setSelectedDept}
        options={board.departments.map((d) => ({ value: d.slug, label: d.name }))}
      />
    </div>
  );
}
