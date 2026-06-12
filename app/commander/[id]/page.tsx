import { notFound } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CommandeForm from "@/components/client/CommandeForm";
import { getProduitById, getPromotionsActives } from "@/lib/data";
import { enrichProduit } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CommanderPage({
  params,
}: {
  params: { id: string };
}) {
  const produit = await getProduitById(params.id);
  if (!produit) notFound();

  const promotions = await getPromotionsActives();
  const p = enrichProduit(produit, promotions);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Passer commande
        </h1>
        <CommandeForm produit={p} />
      </main>
      <Footer />
    </>
  );
}
