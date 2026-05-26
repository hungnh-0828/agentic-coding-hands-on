import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";

import { AwardCard } from "./award-card";

type AwardRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  display_order: number;
};

const FALLBACK_AWARDS: AwardRow[] = [
  { id: "1", slug: "top-talent",         title: "Top Talent",                 description: "Vinh danh top cá nhân xuất sắc trên mọi phương diện", display_order: 1 },
  { id: "2", slug: "top-project",        title: "Top Project",                description: "Tôn vinh những dự án xuất sắc nhất năm",               display_order: 2 },
  { id: "3", slug: "top-project-leader", title: "Top Project Leader",         description: "Lãnh đạo dự án truyền cảm hứng và dẫn dắt thành công", display_order: 3 },
  { id: "4", slug: "best-manager",       title: "Best Manager",               description: "Quản lý xuất sắc, phát triển đội ngũ vững mạnh",       display_order: 4 },
  { id: "5", slug: "signature-creator",  title: "Signature 2025 - Creator",   description: "Dấu ấn sáng tạo nổi bật trong năm 2025",               display_order: 5 },
  { id: "6", slug: "mvp",                title: "MVP (Most Valuable Person)", description: "Cá nhân có đóng góp giá trị nhất cho tổ chức",          display_order: 6 },
];

async function fetchAwards(): Promise<AwardRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("awards")
      .select("id, slug, title, description, display_order")
      .order("display_order", { ascending: true });
    if (error || !data?.length) return FALLBACK_AWARDS;
    return data;
  } catch {
    return FALLBACK_AWARDS;
  }
}

export async function AwardsSection() {
  const t = await getTranslations("awards");
  const awards = await fetchAwards();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-24">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-saa-accent">{t("caption")}</p>
        <h2 className="mt-3 text-3xl font-bold text-saa-text sm:text-4xl">{t("title")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-saa-muted">{t("subtitle")}</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((a) => (
          <AwardCard key={a.id} slug={a.slug} title={a.title} description={a.description} />
        ))}
      </div>
    </section>
  );
}
