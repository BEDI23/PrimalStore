import ClientPageShell from "@/components/client/ClientPageShell";
import { FormSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CommanderLoading() {
  return (
    <ClientPageShell>
      <div className="mx-auto max-w-lg">
        <Skeleton className="mb-6 h-8 w-48" />
        <FormSkeleton />
      </div>
    </ClientPageShell>
  );
}
