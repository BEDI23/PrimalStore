import Link from "next/link";
import ConfirmationWhatsApp from "@/components/client/ConfirmationWhatsApp";
import { CheckCircle } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-primary" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Commande enregistrée !
      </h1>
      <p className="mt-4 text-gray-600">
        Merci ! Notre équipe va vous écrire sur WhatsApp pour confirmer votre
        commande et organiser la livraison.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/produits" className="btn-secondary">
          Voir nos autres produits
        </Link>
      </div>
      <ConfirmationWhatsApp />
    </div>
  );
}
