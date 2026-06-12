import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AdminPromotionsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 max-w-lg rounded-xl" />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
