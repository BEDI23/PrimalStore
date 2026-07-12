"use client";

import { FcShop, FcShipped, FcMoneyTransfer } from "react-icons/fc";
import { motion, useReducedMotion, type Transition, type Variants } from "motion/react";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { BOUTIQUE_NOM } from "@/lib/constants";

const MotionLink = motion.create(Link);

const EASE_SIGNATURE = [0.16, 1, 0.3, 1] as const;
const PRESS_SPRING: Transition = { type: "spring", stiffness: 420, damping: 24, mass: 0.6 };

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SIGNATURE } },
};

export default function HeroSection() {
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour ${BOUTIQUE_NOM}, je souhaite passer une commande.`
  );
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-brand-dark text-white">
      <motion.div
        className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24"
        variants={reduceMotion ? undefined : container}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "show"}
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur sm:text-sm"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Large catalogue à Lomé
        </motion.span>

        <motion.h1
          variants={item}
          className="font-display mt-6 text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl sm:tracking-[-0.03em] lg:text-7xl lg:tracking-[-0.04em]"
        >
          Tout ce qu&apos;il vous faut,
          <br className="hidden sm:block" />{" "}
          <span className="text-gradient-brand">à portée de clic</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-5 max-w-md text-sm font-normal text-white/60 sm:text-base"
        >
          Parcourez, choisissez, commandez en un message. Simple comme
          bonjour.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <MotionLink
            href="/categories"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97, y: 0 }}
            transition={PRESS_SPRING}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-layered transition-[box-shadow,background-color] duration-300 [transition-timing-function:var(--ease-signature)] hover:bg-primary-dark hover:shadow-layered-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-brand-dark sm:w-auto"
          >
            Voir le catalogue
          </MotionLink>
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97, y: 0 }}
            transition={PRESS_SPRING}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition-[border-color,background-color] duration-300 [transition-timing-function:var(--ease-signature)] hover:border-white/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-dark sm:w-auto"
          >
            Commander sur WhatsApp
          </motion.a>
        </motion.div>
      </motion.div>

      <div className="border-t border-white/10 bg-black/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-3 sm:gap-6 sm:py-8">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 sm:text-base">
            <FcShop className="h-5 w-5 shrink-0" />
            <span>Catalogue varié</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 sm:text-base">
            <FcShipped className="h-5 w-5 shrink-0" />
            <span>Livraison à Lomé</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 sm:text-base">
            <FcMoneyTransfer className="h-5 w-5 shrink-0" />
            <span>Paiement à la livraison</span>
          </div>
        </div>
      </div>
    </section>
  );
}
