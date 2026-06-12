import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-48 max-w-md rounded-xl" />
      <TableSkeleton rows={4} cols={3} />
    </div>
  );
}
