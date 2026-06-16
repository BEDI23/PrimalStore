import { getWhatsAppUrl } from "@/lib/whatsapp";

export default function HeroSection() {
  const whatsappUrl = getWhatsAppUrl(
    "Bonjour PIPA-STOR, je souhaite passer une commande."
  );

  return (
    <section className="bg-brand-dark text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Large catalogue à Lomé
        </span>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Tout ce qu&apos;il vous faut,
          <br className="hidden sm:block" />{" "}
          <span className="text-gradient-brand">livré chez vous</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
          Produits naturels, articles ménagers, projecteurs, high-tech et bien
          plus — parcourez nos catégories et commandez facilement
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#produits"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark sm:w-auto"
          >
            Voir le catalogue
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10 sm:w-auto"
          >
            Commander sur WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-3 sm:gap-6 sm:py-8">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 sm:text-base">
            <span className="text-lg">🛍️</span>
            <span>Catalogue varié</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 sm:text-base">
            <span className="text-lg">🛵</span>
            <span>Livraison à Lomé</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 sm:text-base">
            <span className="text-lg">💰</span>
            <span>Paiement à la livraison</span>
          </div>
        </div>
      </div>
    </section>
  );
}
