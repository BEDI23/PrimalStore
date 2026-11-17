/**
 * Meta Pixel — helpers côté navigateur.
 * Rien n'est chargé ni envoyé sans consentement explicite (RGPD) et sans
 * NEXT_PUBLIC_META_PIXEL_ID. Les événements « conversion » partagent un
 * event_id avec la Conversions API de l'API NestJS (déduplication).
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const CONSENT_STORAGE_KEY = "primal:cookie-consent";
export const CONSENT_EVENT = "primal:consent-change";

export type Consent = "granted" | "denied";

type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function isPixelConfigured(): boolean {
  return META_PIXEL_ID.length > 0;
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage indisponible : le choix vaut pour la session en cours seulement.
  }
  if (value === "denied") window.fbq?.("consent", "revoke");
  else window.fbq?.("consent", "grant");
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Efface le choix : le bandeau réapparaît et le pixel est mis en pause. */
export function resetConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignoré
  }
  window.fbq?.("consent", "revoke");
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function hasConsent(): boolean {
  return getConsent() === "granted";
}

/** Identifiant d'événement partagé avec l'API (cf. MetaConversionsService). */
export const purchaseEventId = (commandeId: number): string =>
  `purchase-${commandeId}`;

/**
 * Blocage du suivi sur les contenus réservés aux majeurs (catégories 18+) :
 * aucun événement navigateur, et la commande n'envoie pas de consentement à l'API.
 */
let trackingBlocked = false;
export function setTrackingBlocked(value: boolean): void {
  trackingBlocked = value;
}
export const isTrackingBlocked = (): boolean => trackingBlocked;

function track(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  if (
    typeof window === "undefined" ||
    !window.fbq ||
    !hasConsent() ||
    trackingBlocked
  )
    return;
  window.fbq("track", event, params, eventId ? { eventID: eventId } : undefined);
}

export const trackPageView = () => track("PageView");

export function trackViewContent(p: { id: number; nom: string; prix: number }) {
  track("ViewContent", {
    content_type: "product",
    content_ids: [String(p.id)],
    content_name: p.nom,
    value: p.prix,
    currency: "XOF",
  });
}

export function trackInitiateCheckout(p: { id: number; prix: number }) {
  track("InitiateCheckout", {
    content_type: "product",
    content_ids: [String(p.id)],
    value: p.prix,
    currency: "XOF",
    num_items: 1,
  });
}

export function trackPurchase(p: {
  commandeId: number;
  produitId: number;
  total: number;
  quantite: number;
}) {
  track(
    "Purchase",
    {
      content_type: "product",
      content_ids: [String(p.produitId)],
      value: p.total,
      currency: "XOF",
      num_items: p.quantite,
    },
    purchaseEventId(p.commandeId),
  );
}

function readCookie(name: string): string | undefined {
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, "\\$&")}=([^;]*)`),
  );
  return m ? decodeURIComponent(m[1]) : undefined;
}

/**
 * Données à joindre à la commande pour la Conversions API.
 * `metaConsent` vaut false (et rien d'autre n'est envoyé) sans consentement.
 */
export function getMetaServerContext(): {
  metaConsent: boolean;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
} {
  if (
    typeof window === "undefined" ||
    trackingBlocked ||
    !hasConsent() ||
    !isPixelConfigured()
  ) {
    return { metaConsent: false };
  }
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return {
    metaConsent: true,
    fbp: readCookie("_fbp"),
    fbc:
      readCookie("_fbc") ??
      (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
    eventSourceUrl: window.location.href,
  };
}
