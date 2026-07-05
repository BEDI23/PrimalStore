import AnimatedNumber from "@/components/admin/AnimatedNumber";

export default function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 border-l-4 border-l-primary bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm text-graphite">{title}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-graphite-light">{subtitle}</p>}
    </div>
  );
}
