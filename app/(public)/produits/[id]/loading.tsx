import ClientPageShell from "@/components/client/ClientPageShell";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

export default function ProduitDetailLoading() {
  return (
    <ClientPageShell>
      <ProductDetailSkeleton />
    </ClientPageShell>
  );
}
