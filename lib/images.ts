// Détection d'une "vraie" image : l'API peut renvoyer une URL vide ou une URL de
// placeholder technique (ex. placehold.co "200×400"). Dans ces cas, on affiche le
// repli visuel de la marque plutôt que l'image.
const PLACEHOLDER_HOSTS =
  /(placehold\.co|placeholder\.com|placehold\.it|dummyimage\.com|fakeimg\.pl|via\.placeholder|lorempixel|picsum\.photos)/i;
// Nom de fichier entier = "placeholder…" ou uniquement des dimensions ("200x400.png")
const PLACEHOLDER_FILES = /^(placeholder|\d{2,4}x\d{2,4}(\.\w+)?$)/i;

export function hasRealImage(url: string | null | undefined): url is string {
  if (!url || !url.trim()) return false;
  if (PLACEHOLDER_HOSTS.test(url)) return false;
  // Nom de fichier "placeholder…" ou "200x400" (y compris l'ancien SVG du projet)
  const filename = url.split("?")[0].split("/").pop() ?? "";
  return !PLACEHOLDER_FILES.test(filename);
}
