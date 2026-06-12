import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AdminProduitsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
