import { getWhatsAppUrl } from "@/lib/whatsapp";

export default function HeroSection() {
  const whatsappUrl = getWhatsAppUrl(
    "Bonjour PIPA-STOR, je souhaite passer une commande."
  );

  return (
    <section className="bg-gradient-to-br from-[#000000] to-[#000000] text-orange-600">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
        <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium backdrop-blur sm:text-sm">
          🛍️ Large catalogue à Lomé
        </span>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Tout ce qu&apos;il vous faut, livré chez vous
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
          Produits naturels, articles ménagers, projecteurs, high-tech et bien
          plus — parcourez nos catégories et commandez facilement
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#produits"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#16a34a] shadow-md transition hover:bg-gray-50 sm:w-auto"
          >
            Voir le catalogue
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border-2 border-white bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Commander sur WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#14532d]/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-3 sm:gap-6 sm:py-8">
          <div className="flex items-center justify-center gap-2 text-sm font-medium sm:text-base">
            <span className="text-lg">🛍️</span>
            <span>Catalogue varié</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium sm:text-base">
            <span className="text-lg">🛵</span>
            <span>Livraison à Lomé</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium sm:text-base">
            <span className="text-lg">💰</span>
            <span>Paiement à la livraison</span>
          </div>
        </div>
      </div>
    </section>
  );
}
