import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";

/** Bandeau d'aide avant le footer : orienter vers WhatsApp / contact. */
export default function HelpCta() {
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${BOUTIQUE_NOM}, j'ai besoin d'aide pour choisir.`
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
        <div className="max-w-lg">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Besoin d&apos;aide pour choisir&nbsp;?
          </h2>
          <p className="mt-2 text-white/70">
            Écrivez-nous, nous répondons rapidement.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Écrire sur WhatsApp
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
