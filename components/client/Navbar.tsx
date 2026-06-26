"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/categories", label: "Catégories" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          onClick={closeMobile}
        >
          <Image
            src="/logo.jpeg"
            alt={BOUTIQUE_NOM}
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="font-display text-base font-bold text-ink sm:text-lg">
            {BOUTIQUE_NOM}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex sm:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "text-sm font-medium transition-colors duration-150",
                isActive(link.href)
                  ? "text-primary font-semibold"
                  : "text-graphite hover:text-ink",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/categories"
            className="btn-primary px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Commander
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" strokeWidth={1.75} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 sm:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className={[
                  "flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  isActive(link.href)
                    ? "bg-primary-50 text-primary font-semibold"
                    : "text-graphite hover:bg-surface-subtle hover:text-ink",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/categories"
              onClick={closeMobile}
              className="btn-primary mt-2 flex min-h-[44px] items-center justify-center text-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Commander
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
