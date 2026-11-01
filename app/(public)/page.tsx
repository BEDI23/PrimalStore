import HeroSection from "@/components/client/HeroSection";
import ProductCard from "@/components/client/ProductCard";
import ProductCardGrid from "@/components/client/ProductCardGrid";
import CategoryGrid from "@/components/client/CategoryGrid";
import SectionHeading from "@/components/client/SectionHeading";
import EmptyState from "@/components/client/EmptyState";
import WhyChooseUs from "@/components/client/WhyChooseUs";
import CommentCaMarche from "@/components/client/CommentCaMarche";
import HelpCta from "@/components/client/HelpCta";
import Reveal from "@/components/client/Reveal";
import { PackageSearch } from "lucide-react";
import { getProduitsPublic, getCategoriesPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [produits, categories] = await Promise.all([
    getProduitsPublic({ limit: 100 }),
    getCategoriesPublic(),
  ]);

  const vedettes = produits.slice(0, 8);
  const promos = produits.filter((p) => p.promotion).slice(0, 4);

  const featuredCategories = categories
    .filter((c) => c.actif)
    .sort((a, b) => a.position - b.position)
    .slice(0, 6);

  return (
    <>
      <HeroSection />

      {featuredCategories.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Catégories"
              title="Nos catégories"
              description="Parcourez notre sélection de produits par catégorie."
              href="/categories"
              hrefLabel="Toutes les catégories"
            />
            <CategoryGrid categories={featuredCategories} />
          </section>
        </Reveal>
      )}

      {promos.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
            <SectionHeading
              eyebrow="Offres"
              title="Promotions en cours"
              href="/produits"
              hrefLabel="Tout le catalogue"
            />
            <ProductCardGrid>
              {promos.map((produit) => (
                <ProductCard key={produit.id} produit={produit} />
              ))}
            </ProductCardGrid>
          </section>
        </Reveal>
      )}

      <Reveal>
        <section
          id="produits"
          className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20"
        >
          <SectionHeading
            eyebrow="Catalogue"
            title="Sélection du catalogue"
            href="/produits"
            hrefLabel="Voir tout le catalogue"
          />
          {vedettes.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Nos produits arrivent bientôt !"
            />
          ) : (
            <ProductCardGrid>
              {vedettes.map((produit) => (
                <ProductCard key={produit.id} produit={produit} />
              ))}
            </ProductCardGrid>
          )}
        </section>
      </Reveal>

      <Reveal>
        <CommentCaMarche />
      </Reveal>

      <Reveal>
        <WhyChooseUs />
      </Reveal>

      <HelpCta />
    </>
  );
}
