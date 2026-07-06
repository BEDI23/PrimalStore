import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, Wallet } from "lucide-react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Breadcrumbs from "@/components/client/Breadcrumbs";
import { getProduitPublic } from "@/lib/api/public-data";
import { formatPrix } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { BOUTIQUE_NOM } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const p = await getProduitPublic(id);
  if (!p) notFound();

  const promo = p.promotion;
  const prixFinal = promo ? promo.prixPromo : p.prix;
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${BOUTIQUE_NOM}, je suis intéressé par "${p.nom}".`
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:pb-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Catalogue", href: "/produits" },
            { label: p.nom },
          ]}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-subtle">
              <Image
                src={p.imageUrl || "/images/placeholder-produit.svg"}
                alt={p.nom}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {p.videoUrl && (
              <div>
                <h2 className="font-display mb-2 text-sm font-semibold text-ink">
                  Vidéo du produit
                </h2>
                <video
                  src={p.videoUrl}
                  controls
                  playsInline
                  className="w-full rounded-2xl bg-black"
                >
                  Votre navigateur ne supporte pas la vidéo.
                </video>
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {p.nom}
            </h1>

            <div className="mt-4 flex items-center gap-3 tabular-nums">
              {promo ? (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrix(p.prix)}
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrix(prixFinal)}
                  </span>
                  <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Promo
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {formatPrix(p.prix)}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-graphite">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Livraison à Lomé
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Paiement à la livraison
              </span>
            </div>

            {p.descriptionCourte && (
              <p className="mt-4 text-graphite">{p.descriptionCourte}</p>
            )}

            {p.descriptionLongue && (
              <div className="mt-6">
                <h2 className="font-display mb-2 font-semibold text-ink">
                  Description
                </h2>
                <p className="whitespace-pre-line text-graphite">
                  {p.descriptionLongue}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/commander/${p.id}`} className="btn-primary">
                Commander ce produit
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Commander sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Barre CTA sticky — mobile uniquement */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <span className="text-lg font-bold tabular-nums text-primary">
          {formatPrix(prixFinal)}
        </span>
        <Link href={`/commander/${p.id}`} className="btn-primary py-2.5">
          Commander
        </Link>
      </div>

      <Footer />
    </>
  );
}
