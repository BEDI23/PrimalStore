import type { ReactNode } from "react";

/** En-tête standard des pages publiques : libellé, titre, description, actions. */
export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Contenu au-dessus du titre (ex. fil d'Ariane) */
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 sm:mb-10">
      {children}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-graphite">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
