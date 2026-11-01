import { notFound } from "next/navigation";
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: produit.nom, href: `/produits/${produit.id}` },
          { label: "Commander" },
        ]}
      />
      <header className="mb-6 sm:mb-8">
        <p className="eyebrow">Commande</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
          Passer commande
        </h1>
        <p className="mt-2 text-sm text-graphite">
          Renseignez vos coordonnées et votre zone de livraison pour finaliser
          votre commande.
        </p>
      </header>
      <CommandeForm produit={produit} />
    </div>
  );
}
