import type { LucideIcon } from "lucide-react";
import { Store, Truck, Wallet } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";
import SectionHeading from "./SectionHeading";

interface Feature {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    Icon: Store,
    title: "Catalogue varié",
    description:
      "Produits naturels, articles ménagers, projecteurs, high-tech et plus encore — trouvez par catégorie ce qu'il vous faut.",
  },
  {
    Icon: Truck,
    title: "Livraison rapide",
    description:
      "Livraison à domicile partout à Lomé. Nous vous contactons sous 30 minutes.",
  },
  {
    Icon: Wallet,
    title: "Paiement à la livraison",
    description:
      "Vous ne payez qu'à la réception de votre commande, une fois le produit en main.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Nos engagements"
          title={`Pourquoi choisir ${BOUTIQUE_NOM} ?`}
          description="Contact direct avec notre équipe, paiement à la réception, livraison près de chez vous."
        />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded-2xl bg-surface-muted p-6 transition-colors duration-200 hover:bg-surface-subtle"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-dark shadow-soft">
                <feature.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
