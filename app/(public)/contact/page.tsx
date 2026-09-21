import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/client/PageHeader";
import { BOUTIQUE_NOM, WHATSAPP_DISPLAY } from "@/lib/constants";
import { getContactEmail } from "@/lib/contact";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = {
  title: `Contact — ${BOUTIQUE_NOM}`,
  description: `Contactez ${BOUTIQUE_NOM} par WhatsApp ou email à Lomé.`,
};

export default function ContactPage() {
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${BOUTIQUE_NOM}, j'ai une question.`
  );
  const email = getContactEmail();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Contact"
        title="Contactez-nous"
        description="Une question, un produit à commander ? Écrivez-nous par WhatsApp ou par email. Nous répondons rapidement."
        actions={
          <>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Écrire sur WhatsApp
            </a>
            <Link href="/produits" className="btn-secondary">
              Commander
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-soft-hover"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-dark">
            <MessageCircle className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-semibold text-ink">
              WhatsApp
            </span>
            <span className="mt-0.5 block text-sm font-medium text-primary-dark">
              {WHATSAPP_DISPLAY}
            </span>
            <span className="mt-2 block text-sm text-graphite">
              Réponse rapide — idéal pour commander
            </span>
          </span>
          <ArrowUpRight
            className="h-5 w-5 shrink-0 text-graphite-light transition-colors group-hover:text-primary-dark"
            aria-hidden="true"
          />
        </a>

        <a
          href={`mailto:${email}?subject=Contact%20${BOUTIQUE_NOM}`}
          className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-soft-hover"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-ink">
            <Mail className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-semibold text-ink">
              Email
            </span>
            <span className="mt-0.5 block break-all text-sm font-medium text-primary-dark">
              {email}
            </span>
            <span className="mt-2 block text-sm text-graphite">
              Pour vos questions et demandes
            </span>
          </span>
          <ArrowUpRight
            className="h-5 w-5 shrink-0 text-graphite-light transition-colors group-hover:text-primary-dark"
            aria-hidden="true"
          />
        </a>
      </div>

      <section
        aria-labelledby="infos-pratiques"
        className="mt-8 rounded-2xl bg-white p-6 sm:p-8"
      >
        <h2
          id="infos-pratiques"
          className="font-display text-lg font-semibold text-ink"
        >
          Informations pratiques
        </h2>
        <ul className="mt-5 grid gap-5 text-sm text-graphite sm:grid-cols-3">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary-dark" strokeWidth={1.75} aria-hidden="true" />
            <span>
              <span className="block font-medium text-ink">Livraison</span>
              Partout au Togo, gratuite à Lomé
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary-dark" strokeWidth={1.75} aria-hidden="true" />
            <span>
              <span className="block font-medium text-ink">Horaires</span>
              Disponible 7j/7 de 8h à 20h
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary-dark" strokeWidth={1.75} aria-hidden="true" />
            <span>
              <span className="block font-medium text-ink">Commande</span>
              Paiement à la livraison
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
