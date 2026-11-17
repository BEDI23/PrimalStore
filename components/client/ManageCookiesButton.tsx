"use client";

import { resetConsent } from "@/lib/meta-pixel";

/** Rouvre le choix de consentement (retrait aussi simple que l'acceptation). */
export default function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Gérer mes cookies
    </button>
  );
}
