import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/navigation";

type Props = {
  slug: string;
  title: string;
  description: string | null;
};

// Award category → glowing orb thumbnail (exported from the design).
const ORB_SRC: Record<string, string> = {
  "top-talent": "/home/orb-top-talent.png",
  "top-project": "/home/orb-top-project.png",
  "top-project-leader": "/home/orb-top-project-leader.png",
  "best-manager": "/home/orb-best-manager.png",
  "signature-creator": "/home/orb-signature-creator.png",
  mvp: "/home/orb-mvp.png",
};

export function AwardCard({ slug, title, description }: Props) {
  const t = useTranslations("awards");
  const orbSrc = ORB_SRC[slug] ?? "/home/award-orb.png";

  return (
    <Link
      href={{ pathname: "/awards-information", hash: slug }}
      className="group flex flex-col transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="overflow-hidden rounded-2xl">
        <Image
          src={orbSrc}
          alt={title}
          width={336}
          height={336}
          className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-lg font-semibold text-saa-text group-hover:text-saa-accent">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm text-saa-muted">{description}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-saa-accent">
          {t("detailLink")}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7v8" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
