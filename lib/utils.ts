import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrix(prix: number): string {
  return `${Math.round(prix).toLocaleString("fr-FR")} FCFA`;
}

// Le client saisit son numéro togolais SANS indicatif (8 chiffres). On tolère les
// séparateurs courants et un indicatif éventuellement collé (+228 / 00228 / 228),
// mais on ne le retire que si le reste fait bien 8 chiffres — sinon un fixe de
// Lomé (22 xx xx xx) serait tronqué à tort.
function nettoyerTelephone(phone: string): string {
  const compact = phone.replace(/[\s.\-()]/g, "");
  const sansIndicatif = compact.replace(/^(?:\+228|00228|228)/, "");
  return sansIndicatif.length === 8 ? sansIndicatif : compact;
}

export function validatePhoneTogo(phone: string): boolean {
  return /^\d{8}$/.test(nettoyerTelephone(phone));
}

/** Convertit la saisie locale au format attendu par l'API (+228XXXXXXXX). */
export function toTelephoneE164(phone: string): string {
  return `+228${nettoyerTelephone(phone)}`;
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  d.setDate(1);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function filterCommandesByDate<T extends { created_at: string }>(
  items: T[],
  filtre: string,
  dateSpecifique?: string
): T[] {
  if (filtre === "toutes" && !dateSpecifique) return items;

  const now = new Date();

  if (dateSpecifique) {
    const target = new Date(dateSpecifique);
    return items.filter((c) => isSameDay(new Date(c.created_at), target));
  }

  switch (filtre) {
    case "aujourdhui":
      return items.filter((c) =>
        isSameDay(new Date(c.created_at), now)
      );
    case "hier": {
      const hier = new Date(now);
      hier.setDate(hier.getDate() - 1);
      return items.filter((c) =>
        isSameDay(new Date(c.created_at), hier)
      );
    }
    case "semaine": {
      const start = getStartOfWeek(now);
      return items.filter((c) => new Date(c.created_at) >= start);
    }
    case "mois": {
      const start = getStartOfMonth(now);
      return items.filter((c) => new Date(c.created_at) >= start);
    }
    default:
      return items;
  }
}
