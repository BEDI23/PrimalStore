import Link from "next/link";
import {
  Clock,
  Home,
  Laptop,
  Leaf,
  MessageCircle,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import HelpCta from "@/components/client/HelpCta";
import SectionHeading from "@/components/client/SectionHeading";
import { BOUTIQUE_NOM, BOUTIQUE_DESCRIPTION } from "@/lib/constants";

export const metadata = {
  title: `À propos — ${BOUTIQUE_NOM}`,
  description: BOUTIQUE_DESCRIPTION,
};

const UNIVERS = [
  { Icon: Leaf, label: "Produits naturels et bien-être" },
  { Icon: Home, label: "Articles ménagers et entretien" },
  { Icon: Laptop, label: "Projecteurs et équipements high-tech" },
  { Icon: Sparkles, label: "Et bien d'autres catégories à découvrir" },
];

const AVANTAGES = [
  {
    Icon: Truck,
    title: "Livraison",
    text: "Partout au Togo, et gratuite à Lomé.",
  },
  {
    Icon: Wallet,
    title: "Paiement à la livraison",
    text: "Vous payez à la réception de votre commande.",
  },
  {
    Icon: MessageCircle,
    title: "Service client",
    text: "Un vrai contact humain sur WhatsApp avant la livraison.",
  },
  {
    Icon: Clock,
    title: "Disponibilité",
    text: "7j/7 de 8h à 20h.",
  },
];

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="eyebrow text-primary-light!">À propos</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
            À propos de {BOUTIQUE_NOM}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Nous sommes une boutique en ligne qui simplifie vos achats du
            quotidien. Chaque commande est traitée personnellement, avec un
            vrai contact humain avant la livraison.
          </p>
        </div>
      </section>

      {/* Histoire / mission */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-2">Notre approche</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Pas de robot, pas de surprise
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed text-graphite">
            <p>
              Chez {BOUTIQUE_NOM}, chaque commande est suivie par une vraie personne.{" "}
              {BOUTIQUE_DESCRIPTION}
            </p>
            <p>
              Basée à Lomé, {BOUTIQUE_NOM} est bien plus qu&apos;une boutique
              de produits naturels. Notre catalogue couvre plusieurs univers
              pour répondre à tous vos besoins du quotidien.
            </p>
            <p>
              Parcourez notre catalogue par catégorie, commandez en ligne et
              payez à la livraison. Notre équipe vous contacte rapidement sur
              WhatsApp pour confirmer votre commande.
            </p>
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {UNIVERS.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4 text-sm font-medium text-ink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-dark">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Avantages */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="Nos engagements" title="Ce que vous pouvez attendre de nous" />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AVANTAGES.map(({ Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-surface-muted p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-dark shadow-soft">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                  {text}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/produits" className="btn-primary">
              Voir le catalogue
            </Link>
            <Link href="/contact" className="btn-secondary">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <HelpCta />
    </>
  );
}
