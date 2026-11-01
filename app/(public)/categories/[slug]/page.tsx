import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import ProductCard from "@/components/client/ProductCard";
import ProductCardGrid from "@/components/client/ProductCardGrid";
import FilterChips from "@/components/client/FilterChips";
import AgeGate from "@/components/client/AgeGate";
import Breadcrumbs from "@/components/client/Breadcrumbs";
import EmptyState from "@/components/client/EmptyState";
import ImageFallback from "@/components/client/ImageFallback";
import SmartImage from "@/components/client/SmartImage";
import {
  getCategoriePublic,
  getSousCategoriesPublic,
  getProduitsPublic,
} from "@/lib/api/public-data";
import { categoryThemeVars, getCategoryIcon } from "@/lib/category-ui";
import { hasRealImage } from "@/lib/images";

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
  const cover = hasRealImage(categorie.coverImageUrl)
    ? categorie.coverImageUrl
    : null;
  const sousCategorieActive = sousCategories.find(
    (sc) => sc.slug === sous_categorie
  );

  return (
    <div style={categoryThemeVars(categorie.theme)}>
      {/* En-tête : image de couverture (ou repli de marque) */}
      <header className="relative isolate overflow-hidden bg-ink-soft">
        <div className="relative h-56 sm:h-72 lg:h-80">
          <SmartImage
            src={cover}
            alt=""
            priority
            sizes="100vw"
            fallback={
              <ImageFallback icon={Icon} tint={categorie.theme?.primary} />
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />

          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-6 sm:px-6 sm:pb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-ink">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                {categorie.isAdult && (
                  <span className="rounded-md bg-ink/85 px-2 py-1 text-xs font-semibold text-white">
                    18+
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {categorie.nom}
              </h1>
              {categorie.description && (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                  {categorie.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Catégories", href: "/categories" },
            { label: categorie.nom },
          ]}
        />

        {/* Filtre sous-catégories */}
        <FilterChips
          categorieSlug={categorie.slug}
          sousCategories={sousCategories}
          activeSlug={sous_categorie}
        />

        {/* Grille produits protégée par l'age gate */}
        <div className="mt-8">
          <AgeGate isAdult={categorie.isAdult}>
            {produits.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Aucun produit dans cette sélection."
                description="Essayez une autre sous-catégorie."
              />
            ) : (
              <ProductCardGrid>
                {produits.map((produit) => (
                  <ProductCard
                    key={produit.id}
                    produit={produit}
                    categorie={sousCategorieActive?.nom ?? categorie.nom}
                  />
                ))}
              </ProductCardGrid>
            )}
          </AgeGate>
        </div>
      </div>
    </div>
  );
}
