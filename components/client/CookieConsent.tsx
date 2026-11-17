"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CONSENT_EVENT,
  getConsent,
  isPixelConfigured,
  setConsent,
} from "@/lib/meta-pixel";

/** Bandeau de consentement : affiché seulement si le pixel est configuré et qu'aucun choix n'a été fait. */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const refresh = () =>
      setVisible(isPixelConfigured() && getConsent() === null);
    refresh();
    window.addEventListener(CONSENT_EVENT, refresh);
    return () => window.removeEventListener(CONSENT_EVENT, refresh);
  }, []);

  if (!visible) return null;

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Préférences cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-5"
    >
      <p className="text-sm text-ink">
        Nous utilisons des cookies de mesure publicitaire (Meta) pour améliorer
        nos annonces. Vous pouvez les refuser, la boutique fonctionne de la même
        façon.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => choose("denied")}>
          Refuser
        </Button>
        <Button type="button" onClick={() => choose("granted")}>
          Accepter
        </Button>
      </div>
    </div>
  );
}
