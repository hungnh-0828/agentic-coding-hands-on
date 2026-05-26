import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";

type Props = {
  slug: string;
  title: string;
  description: string | null;
};

export function AwardCard({ slug, title, description }: Props) {
  const t = useTranslations("awards");

  return (
    <Link
      href={{ pathname: "/awards-information", hash: slug }}
      className="saa-card-glow group flex flex-col overflow-hidden rounded-2xl bg-saa-bg-elev p-5 transition-transform"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-saa-accent/15 via-transparent to-saa-accent/5 ring-1 ring-saa-border" />
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-lg font-semibold text-saa-text group-hover:text-saa-accent">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm text-saa-muted">{description}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-saa-accent">
          {t("detailLink")}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
