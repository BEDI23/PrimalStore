import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** En-tête commun des pages admin : icône, titre, description et actions. */
export default function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-graphite">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
