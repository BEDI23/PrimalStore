import { BOUTIQUE_NOM, WHATSAPP_DISPLAY } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const whatsappUrl = getWhatsAppUrl();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + info */}
          <div className="text-center sm:text-left">
            <p className="font-display text-lg font-bold text-white">
              {BOUTIQUE_NOM}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/70 sm:justify-start">
              <MapPin className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Livraison uniquement à Lomé, Togo
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/70 sm:justify-start">
              <Clock className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Disponible 7j/7 de 8h à 20h
            </p>
            <div className="mt-3 flex justify-center gap-4 text-sm sm:justify-start">
              <Link
                href="/categories"
                className="text-white/70 transition-colors duration-150 hover:text-white"
              >
                Catégories
              </Link>
              <Link
                href="/a-propos"
                className="text-white/70 transition-colors duration-150 hover:text-white"
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="text-white/70 transition-colors duration-150 hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center gap-2 text-center sm:items-end sm:text-right">
            <p className="text-sm font-medium text-white/70">Contactez-nous</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-ink"
            >
              <Phone className="h-4 w-4" strokeWidth={1.75} />
              {WHATSAPP_DISPLAY}
              <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
            </a>
            <Link
              href="/contact"
              className="text-xs text-white/50 transition-colors duration-150 hover:text-white/80"
            >
              Email et autres moyens →
            </Link>
          </div>
        </div>

        <p className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {BOUTIQUE_NOM}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
