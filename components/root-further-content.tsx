import Image from "next/image";
import { useTranslations } from "next-intl";

export function RootFurtherContent() {
  const t = useTranslations("rootFurther");
  const intro = t.raw("intro") as string[];
  const outro = t.raw("outro") as string[];

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex justify-center">
          <Image
            src="/login/root-further.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            className="h-auto w-[200px] sm:w-[260px]"
          />
        </div>

        <div className="mt-12 space-y-6 text-justify text-base leading-relaxed text-saa-text/90 sm:text-lg">
          {intro.map((p, i) => (
            <p key={`intro-${i}`}>{p}</p>
          ))}

          <figure className="py-4 text-center">
            <blockquote className="text-lg font-semibold text-saa-text sm:text-xl">
              {t("quote")}
            </blockquote>
            <figcaption className="mt-2 text-sm text-saa-muted">
              {t("quoteSource")}
            </figcaption>
          </figure>

          {outro.map((p, i) => (
            <p key={`outro-${i}`}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
