import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ProductGrid from "@/components/client/ProductGrid";
import { getProduitsPublic, getCategoriesPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const [produits, categories] = await Promise.all([
    getProduitsPublic({ categorieSlug: searchParams.categorie, limit: 100 }),
    getCategoriesPublic(),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Catalogue</h1>
        <p className="mb-8 text-gray-500">
          Naturel, ménager, high-tech et plus — livraison à Lomé
        </p>
        <ProductGrid
          produits={produits}
          categories={categories}
          activeCategorieSlug={searchParams.categorie}
        />
      </main>
      <Footer />
    </>
  );
}
