import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "@/components/admin/AnimatedNumber";

const TONES = {
  primary: "from-primary to-primary-light shadow-primary/30",
  green: "from-emerald-500 to-emerald-400 shadow-emerald-500/30",
  blue: "from-sky-500 to-sky-400 shadow-sky-500/30",
  violet: "from-violet-500 to-violet-400 shadow-violet-500/30",
} as const;

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "primary",
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: keyof typeof TONES;
  /** Délai d'entrée (ms) pour un effet en cascade */
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-in fade-in-0 slide-in-from-bottom-3 group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm duration-500 fill-mode-both transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Halo décoratif qui s'agrandit au survol */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-graphite">{title}</p>
          <p className="mt-1.5 truncate font-display text-2xl font-bold tabular-nums text-ink">
            {typeof value === "number" ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-graphite-light">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${TONES[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
