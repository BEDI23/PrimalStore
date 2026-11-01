import type { LucideIcon } from "lucide-react";
import { MessageCircle, PackageCheck, Search } from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Etape {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const etapes: Etape[] = [
  {
    Icon: Search,
    title: "Choisissez",
    description: "Le produit qui vous plaît dans le catalogue.",
  },
  {
    Icon: MessageCircle,
    title: "Commandez",
    description: "Remplissez le formulaire : votre commande nous parvient aussitôt.",
  },
  {
    Icon: PackageCheck,
    title: "Recevez",
    description: "Notre équipe vous écrit sur WhatsApp pour confirmer, puis vous payez à la réception.",
  },
];

export default function CommentCaMarche() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="En 3 étapes"
        title="Comment ça marche ?"
        description="Pas de compte compliqué, pas de carte bancaire à sortir."
      />

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {etapes.map((etape, index) => (
          <li
            key={etape.title}
            className="rounded-2xl border border-gray-100 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-dark">
                <etape.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span
                className="font-display text-3xl font-bold text-gray-200"
                aria-hidden="true"
              >
                0{index + 1}
              </span>
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">
              {etape.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-graphite">
              {etape.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
