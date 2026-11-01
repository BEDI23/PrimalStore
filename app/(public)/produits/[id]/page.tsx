import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Clock,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import Breadcrumbs from "@/components/client/Breadcrumbs";
import ProductGallery from "@/components/client/ProductGallery";
import { getProduitPublic } from "@/lib/api/public-data";
import { hasRealImage } from "@/lib/images";
import { galleryOf } from "@/lib/media";
import { formatPrix } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { BOUTIQUE_NOM } from "@/lib/constants";

export const dynamic = "force-dynamic";

const INFOS = [
  { icon: Wallet, titre: "Paiement", detail: "À la livraison" },
  { icon: MapPin, titre: "Livraison", detail: "Partout au Togo, gratuite à Lomé" },
  { icon: Clock, titre: "Disponibilité", detail: "7j/7, de 8h à 20h" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const produit = Number.isFinite(Number(id))
    ? await getProduitPublic(Number(id))
    : null;
  if (!produit) return {};
  return {
    title: `${produit.nom} — ${BOUTIQUE_NOM}`,
    description: produit.descriptionCourte,
    openGraph: hasRealImage(produit.imageUrl)
      ? { images: [produit.imageUrl] }
      : undefined,
  };
}

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
  const categorie = p.sousCategorie?.categorie;
  const items = galleryOf(p).map((m) => ({
    id: m.id,
    type: m.type,
    url: m.url,
    posterUrl: m.posterUrl,
    mimeType: m.mimeType,
  }));
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${BOUTIQUE_NOM}, je suis intéressé par "${p.nom}".`
  );

  const remise = promo
    ? Math.round((1 - promo.prixPromo / p.prix) * 100)
    : 0;

  // Apparition progressive des blocs d'information (léger décalage, rapide).
  const reveal = (n: number) => ({
    animationDelay: `${n * 70}ms`,
    animationFillMode: "backwards" as const,
  });
  const revealClass =
    "animate-in fade-in-0 slide-in-from-bottom-2 duration-500";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-12">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Catalogue", href: "/produits" },
            ...(categorie
              ? [{ label: categorie.nom, href: `/categories/${categorie.slug}` }]
              : []),
            { label: p.nom },
          ]}
        />

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-start md:gap-10 lg:gap-14">
          {/* Vitrine média : reste visible pendant la lecture de la fiche (desktop) */}
          <div className="min-w-0 md:sticky md:top-24">
            <ProductGallery nom={p.nom} items={items} promo={!!promo} />
          </div>

          {/* Informations */}
          <div className="flex min-w-0 flex-col md:py-1">
            <div className={revealClass} style={reveal(0)}>
              {categorie && (
                <p className="text-xs">
                  <Link
                    href={`/categories/${categorie.slug}`}
                    className="eyebrow hover:underline"
                  >
                    {categorie.nom}
                  </Link>
                  {p.sousCategorie && (
                    <span className="font-medium uppercase tracking-[0.14em] text-graphite-light">
                      {" "}
                      · {p.sousCategorie.nom}
                    </span>
                  )}
                </p>
              )}
              <h1 className="mt-2 break-words font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
                {p.nom}
              </h1>
            </div>

            {/* Prix : premier élément lu après le nom */}
            <div
              className={`mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums ${revealClass}`}
              style={reveal(1)}
            >
              <span
                className={`font-display text-4xl font-bold tracking-tight ${
                  promo ? "text-primary-dark" : "text-ink"
                }`}
              >
                {formatPrix(prixFinal)}
              </span>
              {promo && (
                <>
                  <span className="text-lg text-graphite-light line-through">
                    {formatPrix(p.prix)}
                  </span>
                  {remise > 0 && (
                    <span className="rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-dark">
                      -{remise}%
                    </span>
                  )}
                </>
              )}
            </div>

            {p.descriptionCourte && (
              <p
                className={`mt-5 break-words text-base leading-relaxed text-graphite ${revealClass}`}
                style={reveal(2)}
              >
                {p.descriptionCourte}
              </p>
            )}

            {/* CTA principal (desktop) : le parcours de commande existant */}
            <div
              className={`mt-7 hidden flex-col gap-3 md:flex ${revealClass}`}
              style={reveal(3)}
            >
              <Link
                href={`/commander/${p.id}`}
                className="btn-primary min-h-14! text-base shadow-layered transition-transform duration-200 hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                Commander ce produit
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <MessageCircle className="h-4 w-4 text-primary-dark" aria-hidden="true" />
                Une question ? Écrivez-nous sur WhatsApp
              </a>
            </div>

            {/* Infos de commande */}
            <ul
              className={`mt-7 grid gap-3 sm:grid-cols-3 ${revealClass}`}
              style={reveal(4)}
            >
              {INFOS.map(({ icon: Icon, titre, detail }) => (
                <li
                  key={titre}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 sm:flex-col sm:gap-2.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-dark">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{titre}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-graphite">
                      {detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {p.descriptionLongue && (
              <div
                className={`mt-8 border-t border-border pt-6 ${revealClass}`}
                style={reveal(5)}
              >
                <h2 className="mb-2 font-display text-lg font-semibold text-ink">
                  Description
                </h2>
                <p className="whitespace-pre-line break-words leading-relaxed text-graphite">
                  {p.descriptionLongue}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre CTA collée en bas — mobile uniquement */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="min-w-0 tabular-nums">
          <p className="text-xs text-graphite">Prix</p>
          <p className="truncate font-display text-lg font-bold text-ink">
            {formatPrix(prixFinal)}
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nous écrire sur WhatsApp"
          className="btn-secondary ml-auto min-h-12! w-12 shrink-0 px-0!"
        >
          <MessageCircle className="h-5 w-5 text-primary-dark" aria-hidden="true" />
        </a>
        <Link href={`/commander/${p.id}`} className="btn-primary min-h-12! flex-1 sm:flex-none">
          Commander
        </Link>
      </div>
    </>
  );
}
