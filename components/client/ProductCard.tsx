import Link from "next/link";
import { Play, ShoppingBag } from "lucide-react";
import type { Produit } from "@/lib/api/types";
import { hasRealImage } from "@/lib/images";
import { formatPrix } from "@/lib/utils";
import ImageFallback from "./ImageFallback";
import SmartImage from "./SmartImage";

function Badge({ label, promo }: { label: string; promo?: boolean }) {
  return (
    <span
      className={`absolute left-2.5 top-2.5 z-10 rounded-md px-2 py-1 text-xs font-semibold ${
        promo ? "bg-primary text-white" : "bg-ink/85 text-white"
      }`}
    >
      {label}
    </span>
  );
}

export default function ProductCard({
  produit,
  categorie,
}: {
  produit: Produit;
  /** Libellé de catégorie affiché au-dessus du nom (si connu de la page) */
  categorie?: string;
}) {
  const promo = produit.promotion;
  const prixFinal = promo ? promo.prixPromo : produit.prix;
  const image = hasRealImage(produit.imageUrl) ? produit.imageUrl : null;
  const href = `/produits/${produit.id}`;

  return (
    <article className="group flex h-full min-w-0 flex-col">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-subtle"
        tabIndex={-1}
        aria-hidden="true"
      >
        {promo && <Badge label="Promo" promo />}
        {!promo && produit.badge === "Nouveau" && <Badge label="Nouveau" />}
        {!promo && produit.badge === "Bestseller" && (
          <Badge label="Bestseller" />
        )}
        <SmartImage
          src={image}
          alt=""
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          fallback={
            <ImageFallback icon={ShoppingBag} tone="light" label={produit.nom} />
          }
        />
        {produit.videoUrl && (
          <span
            title="Ce produit a une vidéo"
            className="absolute bottom-2.5 right-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-white"
          >
            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span className="sr-only">Vidéo disponible</span>
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {categorie && (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-graphite-light">
            {categorie}
          </p>
        )}
        <h3 className="mt-0.5 line-clamp-2 break-words text-sm font-medium leading-snug text-ink sm:text-base">
          <Link
            href={href}
            className="transition-colors hover:text-primary-dark"
          >
            {produit.nom}
          </Link>
        </h3>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 tabular-nums">
          <span
            className={`text-base font-semibold ${
              promo ? "text-primary-dark" : "text-ink"
            }`}
          >
            {formatPrix(prixFinal)}
          </span>
          {promo && (
            <span className="text-sm text-graphite-light line-through">
              {formatPrix(produit.prix)}
            </span>
          )}
        </div>

        <Link
          href={`/commander/${produit.id}`}
          className="btn-outline mt-3 w-full"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Commander
        </Link>
      </div>
    </article>
  );
}
