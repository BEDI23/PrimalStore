import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import CategoryGrid from "@/components/client/CategoryGrid";
import EmptyState from "@/components/client/EmptyState";
import PageHeader from "@/components/client/PageHeader";
import { getCategoriesPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catégories — Plamastore",
};

export default async function CategoriesPage() {
  const categories = (await getCategoriesPublic())
    .filter((c) => c.actif)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Catalogue"
        title="Nos catégories"
        description="Découvrez notre sélection de produits par catégorie."
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nous préparons actuellement nos catégories."
          description="Revenez très bientôt."
        />
      ) : (
        <CategoryGrid categories={categories} />
      )}
    </div>
  );
}
