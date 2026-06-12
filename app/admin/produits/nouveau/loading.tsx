import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function NouveauProduitLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-56" />
      <FormSkeleton />
    </div>
  );
}
