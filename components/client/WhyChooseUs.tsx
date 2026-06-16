import { BOUTIQUE_NOM } from "@/lib/constants";

const features = [
  {
    icon: "🛍️",
    title: "Catalogue varié",
    description:
      "Produits naturels, articles ménagers, projecteurs, high-tech et plus encore — trouvez par catégorie ce qu'il vous faut.",
  },
  {
    icon: "🛵",
    title: "Livraison rapide",
    description:
      "Livraison à domicile partout à Lomé. Nous vous contactons sous 30 minutes.",
  },
  {
    icon: "💰",
    title: "Paiement à la livraison",
    description:
      "Payez uniquement à la réception de votre commande. Zéro risque pour vous.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#f9fafb] px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Pourquoi choisir {BOUTIQUE_NOM} ?
          </h2>
          <span className="brand-rule mt-4" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary-100 hover:shadow-md"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-3xl transition group-hover:bg-primary-100">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
