import Link from "next/link";
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
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          À propos de {BOUTIQUE_NOM}
        </h1>

        <p className="mt-6 text-gray-600 leading-relaxed">
          {BOUTIQUE_DESCRIPTION}
        </p>

        <p className="mt-4 text-gray-600 leading-relaxed">
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
              className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-gray-700"
            >
              <span className="text-primary">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-gray-600 leading-relaxed">
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
