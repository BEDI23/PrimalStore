"use client";

import { useEffect } from "react";
import {
  setTrackingBlocked,
  trackInitiateCheckout,
  trackViewContent,
} from "@/lib/meta-pixel";

/** Déclenche ViewContent sur une fiche produit. Ne rend rien. */
export function ViewContentTracker(p: { id: number; nom: string; prix: number }) {
  useEffect(() => {
    // Le pixel peut se charger un peu après le montage : on retente brièvement.
    let tries = 0;
    const t = setInterval(() => {
      if (window.fbq || ++tries > 20) {
        clearInterval(t);
        trackViewContent(p);
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);
  return null;
}

/** Déclenche InitiateCheckout à l'ouverture du formulaire de commande. */
export function InitiateCheckoutTracker(p: { id: number; prix: number }) {
  useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      if (window.fbq || ++tries > 20) {
        clearInterval(t);
        trackInitiateCheckout(p);
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);
  return null;
}

/** À placer sur les pages 18+ : désactive tout suivi Meta tant que la page est affichée. */
export function TrackingBlock() {
  useEffect(() => {
    setTrackingBlocked(true);
    return () => setTrackingBlocked(false);
  }, []);
  return null;
}
