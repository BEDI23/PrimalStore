import ClientPageShell from "@/components/client/ClientPageShell";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CommanderLoading() {
  return (
    <ClientPageShell>
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-8 h-9 w-56" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <Skeleton className="h-72 rounded-2xl lg:order-2" />
          <div className="space-y-6 lg:order-1">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    </ClientPageShell>
  );
}
