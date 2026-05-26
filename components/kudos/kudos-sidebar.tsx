"use client";

import { useTranslations } from "next-intl";

import { useKudosBoard } from "./kudos-board-context";

import type { KudosUserStats } from "@/lib/kudos/types";

// Mock data for "10 latest" sidebar lists — there's no prize table in this iteration.
const MOCK_RECENT_PRIZES = [
  { name: "Huỳnh Dương Xuân", note: "Nhận được 1 áo phông SAA" },
  { name: "Trần Anh Tuấn",    note: "Nhận được 1 bình giữ nhiệt SAA" },
  { name: "Phạm Phương Mai",  note: "Nhận được 1 voucher 200K" },
  { name: "Lê Quang Minh",    note: "Nhận được 1 set bút SAA" },
];

const MOCK_RECENT_RANKS = [
  { name: "Nguyễn Thu Hương",  note: "Lên hạng ⭐⭐" },
  { name: "Phạm Phương Mai",   note: "Lên hạng ⭐" },
  { name: "Trần Anh Tuấn",     note: "Lên hạng ⭐⭐⭐" },
];

export function KudosSidebar({ stats }: { stats: KudosUserStats }) {
  const t = useTranslations("kudos.sidebar");
  const { showToast } = useKudosBoard();
  const tTodo = useTranslations("kudos");

  return (
    <aside className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-saa-bg-elev/70 p-6">
        <dl className="space-y-3 text-sm">
          <StatRow label={t("received")}    value={stats.received} />
          <StatRow label={t("sent")}        value={stats.sent} />
          <StatRow label={t("hearts")}      value={stats.hearts} />
          <hr className="my-2 border-white/10" />
          <StatRow label={t("boxOpened")}   value={stats.boxesOpened} />
          <StatRow label={t("boxUnopened")} value={stats.boxesUnopened} />
        </dl>
        <button
          type="button"
          onClick={() => showToast(tTodo("todoToast"))}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-saa-accent text-sm font-bold text-saa-bg hover:bg-saa-accent-soft"
        >
          {t("openBox")}
        </button>
      </div>

      <Leaderboard title={t("recentRanks")}   items={MOCK_RECENT_RANKS}   empty={t("empty")} />
      <Leaderboard title={t("recentPrizes")}  items={MOCK_RECENT_PRIZES}  empty={t("empty")} />
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-saa-muted">{label}:</dt>
      <dd className="font-semibold text-saa-accent">{value}</dd>
    </div>
  );
}

function Leaderboard({
  title,
  items,
  empty,
}: {
  title: string;
  items: { name: string; note: string }[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-saa-bg-elev/70 p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-saa-accent">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-saa-muted">{empty}</li>
        ) : (
          items.map((item) => (
            <li key={item.name + item.note} className="flex items-center gap-3 text-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-saa-accent/20 text-xs font-semibold text-saa-accent">
                {item.name.charAt(0)}
              </span>
              <div className="leading-tight">
                <p className="font-semibold text-saa-text">{item.name}</p>
                <p className="text-xs text-saa-muted">{item.note}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
