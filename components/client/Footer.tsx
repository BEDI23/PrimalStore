import { BOUTIQUE_NOM, WHATSAPP_DISPLAY } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Clock, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const whatsappUrl = getWhatsAppUrl();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-gray-900">{BOUTIQUE_NOM}</p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-500 sm:justify-start">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              Livraison uniquement à Lomé, Togo
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-500 sm:justify-start">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              Disponible 7j/7 de 8h à 20h
            </p>
            <div className="mt-3 flex justify-center gap-4 text-sm sm:justify-start">
              <a href="/a-propos" className="text-gray-500 hover:text-primary">
                À propos
              </a>
              <a href="/contact" className="text-gray-500 hover:text-primary">
                Contact
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center sm:items-end sm:text-right">
            <p className="text-sm font-medium text-gray-700">Contactez-nous</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-100"
            >
              <Phone className="h-4 w-4" />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href="/contact"
              className="text-xs text-gray-500 hover:text-primary"
            >
              Email et autres moyens →
            </a>
          </div>
        </div>

        <p className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {BOUTIQUE_NOM}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
