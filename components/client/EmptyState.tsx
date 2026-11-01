import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-subtle text-graphite">
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-graphite">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
