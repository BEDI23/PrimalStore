import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ModifierProduitLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-64" />
      <FormSkeleton />
    </div>
  );
}
