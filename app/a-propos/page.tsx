import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { BOUTIQUE_NOM, BOUTIQUE_DESCRIPTION } from "@/lib/constants";

export const metadata = {
  title: `À propos — ${BOUTIQUE_NOM}`,
  description: BOUTIQUE_DESCRIPTION,
};

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          À propos de {BOUTIQUE_NOM}
        </h1>

        <p className="mt-6 text-graphite leading-relaxed">
          {BOUTIQUE_DESCRIPTION}
        </p>

        <p className="mt-4 text-graphite leading-relaxed">
          Basée à Lomé, {BOUTIQUE_NOM} est bien plus qu&apos;une boutique de
          produits naturels. Notre catalogue couvre plusieurs univers pour
          répondre à tous vos besoins du quotidien :
        </p>

        <ul className="mt-6 space-y-3">
          {[
            "Produits naturels et bien-être",
            "Articles ménagers et entretien",
            "Projecteurs et équipements high-tech",
            "Et bien d'autres catégories à découvrir",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-graphite"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-graphite leading-relaxed">
          Parcourez notre catalogue par catégorie, commandez en ligne et payez
          à la livraison. Notre équipe vous contacte rapidement sur WhatsApp
          pour confirmer votre commande.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/produits" className="btn-primary text-center">
            Voir le catalogue
          </Link>
          <Link href="/contact" className="btn-secondary text-center">
            Nous contacter
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
