import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ProductGrid from "@/components/client/ProductGrid";
import { getProduitsActifs, getPromotionsActives, getCategories } from "@/lib/data";
import { enrichProduits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProduitsPage() {
  const [produits, promotions, categories] = await Promise.all([
    getProduitsActifs(),
    getPromotionsActives(),
    getCategories(),
  ]);

  const enriched = enrichProduits(produits, promotions);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Catalogue</h1>
        <p className="mb-8 text-gray-500">
          Naturel, ménager, high-tech et plus — livraison à Lomé
        </p>
        <ProductGrid produits={enriched} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
