"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { MessageCircle, Store, Truck, Wallet } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { BOUTIQUE_NOM } from "@/lib/constants";

const EASE_SIGNATURE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_SIGNATURE },
  },
};

const REASSURANCES = [
  { Icon: Store, label: "Catalogue varié" },
  { Icon: Truck, label: "Livraison à Lomé" },
  { Icon: Wallet, label: "Paiement à la livraison" },
];

export default function HeroSection() {
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${BOUTIQUE_NOM}, je souhaite passer une commande.`
  );
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-brand-dark text-white">
      <motion.div
        className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24"
        variants={reduceMotion ? undefined : container}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "show"}
      >
        <motion.p
          variants={item}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Large catalogue à Lomé
        </motion.p>

        <motion.h1
          variants={item}
          className="mx-auto mt-6 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
        >
          Tout ce qu&apos;il vous faut,{" "}
          <span className="text-primary-light">à portée de clic</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/65"
        >
          Parcourez le catalogue, commandez en quelques clics, puis payez à la livraison.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Link href="/categories" className="btn-primary px-8">
            Voir le catalogue
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Commander sur WhatsApp
          </a>
        </motion.div>
      </motion.div>

      <div className="border-t border-white/10">
        <ul
          aria-label="Nos engagements"
          className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6"
        >
          {REASSURANCES.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2.5 text-sm text-white/75"
            >
              <Icon
                className="h-[18px] w-[18px] text-primary-light"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
