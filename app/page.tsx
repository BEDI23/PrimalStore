import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import HeroSection from "@/components/client/HeroSection";
import ProductCard from "@/components/client/ProductCard";
import WhyChooseUs from "@/components/client/WhyChooseUs";
import { getProduitsActifs, getPromotionsActives } from "@/lib/data";
import { enrichProduits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [produits, promotions] = await Promise.all([
    getProduitsActifs(),
    getPromotionsActives(),
  ]);

  const enriched = enrichProduits(produits, promotions);
  const vedettes = enriched.slice(0, 6);
  const promos = enriched.filter((p) => p.enPromo);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {promos.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              🔥 Promotions en cours
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((produit) => (
                <ProductCard key={produit.id} produit={produit} />
              ))}
            </div>
          </section>
        )}

        <section id="produits" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Sélection du catalogue
          </h2>
          {vedettes.length === 0 ? (
            <p className="text-center text-gray-500">
              Nos produits arrivent bientôt !
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <WhyChooseUs />
      </main>
      <Footer />
    </>
  );
}
