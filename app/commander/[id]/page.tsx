import { notFound } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Breadcrumbs from "@/components/client/Breadcrumbs";
import CommandeForm from "@/components/client/CommandeForm";
import { getProduitPublic } from "@/lib/api/public-data";

export const dynamic = "force-dynamic";

export default async function CommanderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const produit = await getProduitPublic(id);
  if (!produit) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: produit.nom, href: `/produits/${produit.id}` },
            { label: "Commander" },
          ]}
        />
        <h1 className="font-display mb-6 text-2xl font-bold text-ink">
          Passer commande
        </h1>
        <CommandeForm produit={produit} />
      </main>
      <Footer />
    </>
  );
}
