import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { BOUTIQUE_NOM, WHATSAPP_DISPLAY } from "@/lib/constants";
import { getContactEmail } from "@/lib/contact";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { ChevronRight, Clock, Mail, MapPin, MessageCircle } from "lucide-react";

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
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Contactez-nous
        </h1>
        <p className="mt-3 text-graphite">
          Une question, un produit à commander ? Écrivez-nous par WhatsApp ou
          par email. Nous répondons rapidement.
        </p>

        <div className="mt-8 space-y-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-surface-subtle p-5 transition hover:bg-surface"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">WhatsApp</p>
              <p className="text-sm text-primary">{WHATSAPP_DISPLAY}</p>
              <p className="mt-1 text-xs text-graphite">
                Réponse rapide — idéal pour commander
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-graphite" />
          </a>

          <a
            href={`mailto:${email}?subject=Contact%20${BOUTIQUE_NOM}`}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">Email</p>
              <p className="text-sm text-primary">{email}</p>
              <p className="mt-1 text-xs text-graphite">
                Pour vos questions et demandes
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-graphite" />
          </a>
        </div>

        <div className="mt-8 rounded-2xl bg-surface-subtle p-6">
          <h2 className="font-display font-semibold text-ink">Informations</h2>
          <ul className="mt-4 space-y-3 text-sm text-graphite">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Livraison uniquement à Lomé, Togo
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Disponible 7j/7 de 8h à 20h
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
