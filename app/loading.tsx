import ClientPageShell from "@/components/client/ClientPageShell";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <ClientPageShell>
      <div className="py-8 text-center sm:py-16">
        <Skeleton className="mx-auto h-10 w-3/4 max-w-md" />
        <Skeleton className="mx-auto mt-4 h-5 w-full max-w-sm" />
        <Skeleton className="mx-auto mt-8 h-12 w-40 rounded-full" />
      </div>
      <Skeleton className="mb-6 h-8 w-48" />
      <ProductGridSkeleton count={6} />
    </ClientPageShell>
  );
}
