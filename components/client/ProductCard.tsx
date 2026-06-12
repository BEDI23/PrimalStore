import Image from "next/image";
import Link from "next/link";
import { ProduitAvecPromo } from "@/lib/types";
import { formatPrix } from "@/lib/utils";

function Badge({
  label,
  type,
}: {
  label: string;
  type: "promo" | "nouveau" | "bestseller";
}) {
  const colors = {
    promo: "bg-red-500 text-white",
    nouveau: "bg-blue-500 text-white",
    bestseller: "bg-orange-500 text-white",
  };
  return (
    <span
      className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
}

export default function ProductCard({ produit }: { produit: ProduitAvecPromo }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-4">
      <Link href={`/produits/${produit.id}`} className="group block">
        <div className="relative h-[220px] overflow-hidden rounded-xl bg-gray-100">
          {produit.enPromo && <Badge label="Promo" type="promo" />}
          {!produit.enPromo && produit.badge === "Nouveau" && (
            <Badge label="Nouveau" type="nouveau" />
          )}
          {!produit.enPromo && produit.badge === "Bestseller" && (
            <Badge label="Bestseller" type="bestseller" />
          )}
          {produit.image_url ? (
            <Image
              src={produit.image_url}
              alt={produit.nom}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <span className="text-5xl">🌿</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/produits/${produit.id}`}>
          <h3 className="line-clamp-2 font-semibold text-gray-900 transition hover:text-primary">
            {produit.nom}
          </h3>
        </Link>

        {produit.description_courte && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {produit.description_courte}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {produit.enPromo ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatPrix(produit.prix)}
              </span>
              <span className="text-lg font-bold text-red-600">
                {formatPrix(produit.prixFinal)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              {formatPrix(produit.prix)}
            </span>
          )}
        </div>

        <Link
          href={`/commander/${produit.id}`}
          className="btn-primary mt-4 w-full py-2.5 text-sm"
        >
          Commander
        </Link>
      </div>
    </div>
  );
}
