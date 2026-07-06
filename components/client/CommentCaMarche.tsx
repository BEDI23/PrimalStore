import type { IconType } from "react-icons";
import { FcSurvey, FcComments, FcPackage } from "react-icons/fc";

interface Etape {
  Icon: IconType;
  numero: string;
  title: string;
  description: string;
}

const etapes: Etape[] = [
  {
    Icon: FcSurvey,
    numero: "1",
    title: "Choisissez",
    description: "Votre produit dans le catalogue.",
  },
  {
    Icon: FcComments,
    numero: "2",
    title: "Commandez",
    description: "En un clic, ça part directement par WhatsApp ou email.",
  },
  {
    Icon: FcPackage,
    numero: "3",
    title: "Recevez",
    description: "Votre commande après confirmation avec notre équipe.",
  },
];

export default function CommentCaMarche() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Comment ça marche ?
        </h2>
        <span className="brand-rule mt-4" />
        <p className="mt-4 max-w-xl text-graphite">
          Pas de compte compliqué, pas de carte bancaire à sortir.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {etapes.map((etape) => (
          <div
            key={etape.numero}
            className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <etape.Icon className="h-8 w-8" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {etape.numero}. {etape.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              {etape.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
