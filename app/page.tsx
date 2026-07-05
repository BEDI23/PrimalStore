import Link from "next/link";
import { Flame } from "lucide-react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import HeroSection from "@/components/client/HeroSection";
import ProductCard from "@/components/client/ProductCard";
import CategoryCard from "@/components/client/CategoryCard";
import WhyChooseUs from "@/components/client/WhyChooseUs";
import Reveal from "@/components/client/Reveal";
import { getProduitsPublic, getCategoriesPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [produits, categories] = await Promise.all([
    getProduitsPublic({ limit: 100 }),
    getCategoriesPublic(),
  ]);

  const vedettes = produits.slice(0, 6);
  const promos = produits.filter((p) => p.promotion);

  const featuredCategories = categories
    .filter((c) => c.actif)
    .sort((a, b) => a.position - b.position)
    .slice(0, 8);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {featuredCategories.length > 0 && (
          <Reveal>
            <section className="mx-auto max-w-6xl px-4 py-12">
              <h2 className="font-display text-2xl font-bold text-ink">
                Nos catégories
              </h2>
              <p className="mt-1 mb-6 text-graphite">
                Parcourez notre sélection de produits par catégorie.
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {featuredCategories.map((categorie) => (
                  <CategoryCard key={categorie.id} categorie={categorie} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/categories" className="btn-secondary">
                  Voir toutes les catégories
                </Link>
              </div>
            </section>
          </Reveal>
        )}

        {promos.length > 0 && (
          <Reveal>
            <section className="mx-auto max-w-6xl px-4 py-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-ink flex items-center gap-2">
                <Flame className="h-6 w-6 text-primary" aria-hidden="true" />
                Promotions en cours
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {promos.map((produit) => (
                  <ProductCard key={produit.id} produit={produit} />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <section id="produits" className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="mb-6 font-display text-2xl font-bold text-ink">
              Sélection du catalogue
            </h2>
            {vedettes.length === 0 ? (
              <p className="text-center text-graphite">
                Nos produits arrivent bientôt !
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {vedettes.map((produit) => (
                  <ProductCard key={produit.id} produit={produit} />
                ))}
              </div>
            )}
            <div className="mt-8 text-center">
              <Link href="/produits" className="btn-secondary">
                Voir tout le catalogue
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <WhyChooseUs />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
