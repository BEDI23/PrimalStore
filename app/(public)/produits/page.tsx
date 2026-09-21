import type { Metadata } from "next";
import PageHeader from "@/components/client/PageHeader";
import ProductGrid from "@/components/client/ProductGrid";
import { getProduitsPublic, getCategoriesPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue — Plamastore",
};

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const [produits, categories] = await Promise.all([
    getProduitsPublic({ categorieSlug: categorie, limit: 100 }),
    getCategoriesPublic(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        title="Catalogue"
        description="Naturel, ménager, high-tech et plus — livraison à Lomé"
      />
      <ProductGrid
        produits={produits}
        categories={categories.filter((c) => c.actif)}
        activeCategorieSlug={categorie}
      />
    </div>
  );
}
