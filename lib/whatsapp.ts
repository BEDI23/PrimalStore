import { WHATSAPP_NUMERO } from "./constants";

export function getWhatsAppNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (fromEnv) return fromEnv.replace(/\D/g, "");
  return WHATSAPP_NUMERO.replace(/\D/g, "");
}

export function getWhatsAppUrl(message?: string): string {
  const num = getWhatsAppNumber();
  const base = `https://wa.me/${num}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}
