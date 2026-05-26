import { Link } from "@/lib/i18n/navigation";

type Props = {
  href: "/" | "/about-saa-2025" | "/awards-information" | "/sun-kudos";
  children: React.ReactNode;
  selected?: boolean;
};

export function NavLink({ href, children, selected = false }: Props) {
  const base =
    "rounded px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors";
  const state = selected
    ? "text-saa-accent underline decoration-saa-accent decoration-2 underline-offset-8"
    : "text-saa-text/85 hover:text-saa-bg hover:bg-saa-accent";

  return (
    <Link href={href} className={`${base} ${state}`}>
      {children}
    </Link>
  );
}
