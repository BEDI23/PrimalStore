import type { Metadata } from "next";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CategoryCard from "@/components/client/CategoryCard";
import { getCategoriesPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catégories — PrimalStore",
};

export default async function CategoriesPage() {
  const categories = (await getCategoriesPublic())
    .filter((c) => c.actif)
    .sort((a, b) => a.position - b.position);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-ink">
          Nos catégories
        </h1>
        <p className="mt-1 text-graphite">
          Découvrez notre sélection de produits par catégorie.
        </p>

        {categories.length === 0 ? (
          <p className="mt-12 text-center text-gray-500">
            Aucune catégorie disponible pour le moment.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((categorie) => (
              <CategoryCard key={categorie.id} categorie={categorie} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
