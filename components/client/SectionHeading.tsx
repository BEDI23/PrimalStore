import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Titre de section (H2) avec description et lien « Voir tout » optionnels. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "Voir tout",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-graphite">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-primary-dark"
        >
          {hrefLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
