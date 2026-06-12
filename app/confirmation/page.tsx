import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { CheckCircle } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Commande envoyée !
        </h1>
        <p className="mt-4 text-gray-600">
          Votre commande a été lancée ! Un livreur va vous écrire sur WhatsApp
          pour confirmer la livraison.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/produits" className="btn-secondary">
            Voir nos autres produits
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
