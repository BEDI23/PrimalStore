import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { getProduitPublic } from "@/lib/api/public-data";
import { formatPrix } from "@/lib/utils";

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

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
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
                <h2 className="mb-2 text-sm font-semibold text-gray-900">
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
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {p.nom}
            </h1>

            <div className="mt-4 flex items-center gap-3">
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

            {p.descriptionCourte && (
              <p className="mt-4 text-gray-600">{p.descriptionCourte}</p>
            )}

            {p.descriptionLongue && (
              <div className="mt-6">
                <h2 className="mb-2 font-semibold text-gray-900">Description</h2>
                <p className="whitespace-pre-line text-gray-600">
                  {p.descriptionLongue}
                </p>
              </div>
            )}

            <Link
              href={`/commander/${p.id}`}
              className="btn-primary mt-8 inline-flex"
            >
              Commander ce produit
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
