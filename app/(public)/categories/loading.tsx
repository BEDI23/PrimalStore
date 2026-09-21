import ClientPageShell from "@/components/client/ClientPageShell";
import { CategoryGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <ClientPageShell>
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="mb-3 h-9 w-64" />
      <Skeleton className="mb-10 h-4 w-80 max-w-full" />
      <CategoryGridSkeleton />
    </ClientPageShell>
  );
}
