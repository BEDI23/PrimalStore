import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AdminCommandesLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <TableSkeleton rows={8} cols={8} />
    </div>
  );
}
