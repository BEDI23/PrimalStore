import ClientPageShell from "@/components/client/ClientPageShell";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ProduitsLoading() {
  return (
    <ClientPageShell>
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-8 h-4 w-72" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-10 w-16 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <ProductGridSkeleton count={8} />
    </ClientPageShell>
  );
}
