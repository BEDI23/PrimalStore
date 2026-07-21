import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ProductCard from "@/components/client/ProductCard";
import FilterChips from "@/components/client/FilterChips";
import AgeGate from "@/components/client/AgeGate";
import {
  getCategoriePublic,
  getSousCategoriesPublic,
  getProduitsPublic,
} from "@/lib/api/public-data";
import { categoryThemeVars, getCategoryIcon } from "@/lib/category-ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sous_categorie?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categorie = await getCategoriePublic(slug);
  if (!categorie) return {};
  return {
    title: `${categorie.nom} — Plamastore`,
  };
}

export default async function CategorySlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { sous_categorie } = await searchParams;
  const categorie = await getCategoriePublic(slug);
  if (!categorie) notFound();

  const [sousCategories, produits] = await Promise.all([
    getSousCategoriesPublic(slug),
    getProduitsPublic({
      categorieSlug: slug,
      sousCategorieSlug: sous_categorie,
      limit: 100,
    }),
  ]);

  const Icon = getCategoryIcon(categorie.iconName);

  return (
    <div style={categoryThemeVars(categorie.theme)}>
      <Navbar />

      {/* Header thémé */}
      <header className="relative overflow-hidden">
        {/* Cover image */}
        <div className="relative h-48 sm:h-64 lg:h-80">
          <Image
            src={categorie.coverImageUrl || "/images/placeholder-produit.svg"}
            alt={categorie.nom}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Ink overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/50 to-ink/20" />

          {/* Content positioned over image */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            {/* Icon chip */}
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex rounded-xl bg-cat-primary/90 p-2.5">
                <Icon
                  className="h-6 w-6 text-cat-on"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </span>
              {categorie.isAdult && (
                <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white">
                  18+
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold text-white">
              {categorie.nom}
            </h1>

            {categorie.description && (
              <p className="mt-1 max-w-xl text-white/80">
                {categorie.description}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Filtre sous-catégories */}
        <FilterChips
          categorieSlug={categorie.slug}
          sousCategories={sousCategories}
          activeSlug={sous_categorie}
        />

        {/* Grille produits protégée par l'age gate */}
        <div className="mt-6">
          <AgeGate isAdult={categorie.isAdult}>
            {produits.length === 0 ? (
              <p className="py-16 text-center text-graphite">
                Aucun produit dans cette sélection.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {produits.map((produit) => (
                  <ProductCard key={produit.id} produit={produit} />
                ))}
              </div>
            )}
          </AgeGate>
        </div>
      </main>

      <Footer />
    </div>
  );
}
