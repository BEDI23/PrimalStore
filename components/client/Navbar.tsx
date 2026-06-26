"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BOUTIQUE_NOM } from "@/lib/constants";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/categories", label: "Catégories" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
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

        {/* Mobile hamburger — Sheet trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 px-4 py-6 sm:hidden">
            <nav className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={[
                      "flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                      isActive(link.href)
                        ? "bg-primary-50 text-primary font-semibold"
                        : "text-graphite hover:bg-surface-subtle hover:text-ink",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link
                  href="/categories"
                  className="btn-primary mt-2 flex min-h-[44px] items-center justify-center text-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Commander
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
