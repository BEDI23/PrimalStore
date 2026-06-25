import { notFound } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CommandeForm from "@/components/client/CommandeForm";
import { getProduitPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export default async function CommanderPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const produit = await getProduitPublic(id);
  if (!produit) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Passer commande
        </h1>
        <CommandeForm produit={produit} />
      </main>
      <Footer />
    </>
  );
}
