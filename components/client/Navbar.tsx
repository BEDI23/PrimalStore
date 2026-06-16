import Image from "next/image";
import Link from "next/link";
import { BOUTIQUE_NOM } from "@/lib/constants";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.jpeg"
            alt={BOUTIQUE_NOM}
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-base font-bold text-gray-900 sm:text-lg">
            {BOUTIQUE_NOM}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/produits"
            className="hidden text-sm font-medium text-gray-600 hover:text-primary sm:inline"
          >
            Catalogue
          </Link>
          <Link
            href="/a-propos"
            className="text-xs font-medium text-gray-600 hover:text-primary sm:text-sm"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="text-xs font-medium text-gray-600 hover:text-primary sm:text-sm"
          >
            Contact
          </Link>
          <Link
            href="/produits"
            className="btn-primary px-3 py-2 text-xs sm:px-5 sm:text-sm"
          >
            Commander
          </Link>
        </div>
      </nav>
    </header>
  );
}
