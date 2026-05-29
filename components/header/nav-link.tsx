"use client";

import { Link, usePathname } from "@/lib/i18n/navigation";

type Props = {
  href: "/" | "/about-saa-2025" | "/awards-information" | "/sun-kudos";
  children: React.ReactNode;
};

export function NavLink({ href, children }: Props) {
  // usePathname() is locale-agnostic (e.g. "/awards-information"), so it matches href directly.
  const pathname = usePathname();
  const selected =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const base = "px-1 py-2 text-base font-medium transition-colors";
  const state = selected
    ? "text-saa-accent underline decoration-saa-accent decoration-2 underline-offset-8"
    : "text-saa-text/85 hover:text-saa-bg hover:bg-saa-accent";

  return (
    <Link href={href} aria-current={selected ? "page" : undefined} className={`${base} ${state}`}>
      {children}
    </Link>
  );
}
