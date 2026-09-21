"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/categories", label: "Catégories" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Le header se compacte légèrement après quelques pixels de scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-[border-color,box-shadow] duration-200 ${
        scrolled ? "border-gray-200 shadow-soft" : "border-transparent"
      }`}
    >
      <nav
        aria-label="Navigation principale"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[height] duration-200 sm:px-6 ${
          scrolled ? "h-14" : "h-16 sm:h-[72px]"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
        >
          <Image
            src="/logo.jpeg"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            {BOUTIQUE_NOM}
          </span>
        </Link>

        {/* Navigation desktop — centrée */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center px-4 text-sm font-medium transition-colors duration-200 ${
                    active ? "text-ink" : "text-graphite hover:text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 bottom-1.5 h-0.5 rounded-full bg-primary transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/categories"
            className="btn-primary hidden min-h-10! px-5 md:inline-flex"
          >
            Commander
          </Link>

          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Ouvrir le menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-surface-subtle md:hidden"
              >
                <Menu className="h-6 w-6" strokeWidth={1.75} />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[min(20rem,88vw)] p-0 md:hidden">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
                <Image
                  src="/logo.jpeg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="font-display text-base font-bold text-ink">
                  {BOUTIQUE_NOM}
                </span>
              </div>
              <nav aria-label="Menu mobile" className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-12 items-center rounded-xl px-4 text-base font-medium transition-colors ${
                          active
                            ? "bg-primary-50 text-primary-dark"
                            : "text-ink hover:bg-surface-subtle"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                <SheetClose asChild>
                  <Link href="/categories" className="btn-primary mt-3 min-h-12!">
                    Commander
                  </Link>
                </SheetClose>
                <a
                  href={getWhatsAppUrl(`Bonjour ${BOUTIQUE_NOM}, j'ai une question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary min-h-12!"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
