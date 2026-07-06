import type { IconType } from "react-icons";
import { FcShop, FcShipped, FcMoneyTransfer } from "react-icons/fc";
import { BOUTIQUE_NOM } from "@/lib/constants";

interface Feature {
  Icon: IconType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    Icon: FcShop,
    title: "Catalogue varié",
    description:
      "Produits naturels, articles ménagers, projecteurs, high-tech et plus encore — trouvez par catégorie ce qu'il vous faut.",
  },
  {
    Icon: FcShipped,
    title: "Livraison rapide",
    description:
      "Livraison à domicile partout à Lomé. Nous vous contactons sous 30 minutes.",
  },
  {
    Icon: FcMoneyTransfer,
    title: "Paiement à la livraison",
    description:
      "Payez uniquement à la réception de votre commande. Zéro risque pour vous.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-surface-subtle px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-center text-2xl font-bold text-ink sm:text-3xl">
            Pourquoi choisir {BOUTIQUE_NOM} ?
          </h2>
          <span className="brand-rule mt-4" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 transition duration-200 group-hover:bg-primary-100">
                <feature.Icon className="h-8 w-8" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-graphite">
          Contact direct avec un vendeur, produits vérifiés, livraison suivie
          près de chez vous. Votre satisfaction, notre priorité — à chaque
          commande.
        </p>
      </div>
    </section>
  );
}
