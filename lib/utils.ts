export function formatPrix(prix: number): string {
  return `${Math.round(prix).toLocaleString("fr-FR")} FCFA`;
}

export function validatePhoneTogo(phone: string): boolean {
  // On tolère les séparateurs courants (espaces, tirets, points, parenthèses)
  // saisis par les clients avant de valider le format togolais (+228 + 8 chiffres).
  const cleaned = phone.replace(/[\s.\-()]/g, "");
  return /^\+228\d{8}$/.test(cleaned);
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
