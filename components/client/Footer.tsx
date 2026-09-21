import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Wallet } from "lucide-react";
import {
  BOUTIQUE_NOM,
  BOUTIQUE_SLOGAN,
  WHATSAPP_DISPLAY,
} from "@/lib/constants";
import { getContactEmail } from "@/lib/contact";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const NAV_LINKS = [
  { href: "/categories", label: "Catégories" },
  { href: "/produits", label: "Catalogue" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const linkClass =
  "inline-flex min-h-9 items-center text-sm text-white/65 transition-colors duration-200 hover:text-white";

export default function Footer() {
  const whatsappUrl = getWhatsAppUrl();
  const email = getContactEmail();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:gap-12">
          {/* Marque */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.jpeg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="font-display text-lg font-bold tracking-tight">
                {BOUTIQUE_NOM}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {BOUTIQUE_SLOGAN}
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Pied de page">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Navigation
            </h2>
            <ul className="mt-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Informations */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Informations
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary-light"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                Livraison partout au Togo, gratuite à Lomé
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary-light"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                Disponible 7j/7 de 8h à 20h
              </li>
              <li className="flex items-start gap-2.5">
                <Wallet
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary-light"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                Paiement à la livraison
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Contact
            </h2>
            <ul className="mt-4 space-y-1">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} gap-2.5`}
                >
                  <MessageCircle
                    className="h-4 w-4 shrink-0 text-primary-light"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  WhatsApp&nbsp;: {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className={`${linkClass} gap-2.5`}>
                  <Mail
                    className="h-4 w-4 shrink-0 text-primary-light"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="break-all">{email}</span>
                </a>
              </li>
            </ul>
            <Link
              href="/categories"
              className="btn-primary mt-5 min-h-10! px-5"
            >
              Commander
            </Link>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:text-left">
          © {new Date().getFullYear()} {BOUTIQUE_NOM}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
