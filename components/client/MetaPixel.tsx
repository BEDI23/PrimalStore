"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  CONSENT_EVENT,
  META_PIXEL_ID,
  getConsent,
  isPixelConfigured,
  trackPageView,
} from "@/lib/meta-pixel";

const PAGEVIEW_DELAY_MS = 800;

/** Charge le Meta Pixel uniquement après consentement, et suit les changements de page. */
export default function MetaPixel() {
  const [granted, setGranted] = useState(false);
  const pathname = usePathname();
  const ready = useRef(false);

  useEffect(() => {
    setGranted(getConsent() === "granted");
    const onChange = () => setGranted(getConsent() === "granted");
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // PageView sur chaque navigation SPA, une fois le pixel initialisé.
  // Léger différé : laisse une page 18+ poser son blocage (TrackingBlock) avant l'envoi.
  useEffect(() => {
    if (!granted || !ready.current) return;
    const t = setTimeout(trackPageView, PAGEVIEW_DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname, granted]);

  if (!isPixelConfigured() || !granted) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onReady={() => {
        ready.current = true;
        setTimeout(trackPageView, PAGEVIEW_DELAY_MS);
      }}
    >
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');`}
    </Script>
  );
}
