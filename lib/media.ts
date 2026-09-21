// Helpers médias produits (images + vidéos) partagés admin / fiche publique.
// Les limites ci-dessous DOIVENT rester alignées avec l'API (uploads.controller.ts,
// produits/constants/media.ts). Elles servent à prévenir l'utilisateur AVANT
// l'envoi : l'API reste l'autorité (elle revalide type réel, taille et bucket).
import { getApiError } from "@/lib/api/http";
import type {
  MediaType,
  Produit,
  ProduitMedia,
  ProduitMediaInput,
} from "@/lib/api/types";

export const MAX_IMAGES = 10;
export const MAX_VIDEOS = 3;
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // MAX_UPLOAD_BYTES (API)
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // MAX_VIDEO_UPLOAD_BYTES (API)
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const VIDEO_ACCEPT = "video/mp4,video/webm";

const IMAGE_TYPES = IMAGE_ACCEPT.split(",");
const VIDEO_TYPES = VIDEO_ACCEPT.split(",");

/** Taille lisible : 1,4 Mo, 820 Ko. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/**
 * Pré-contrôle côté navigateur (confort, pas sécurité) : message FR ou null.
 * Le type déclaré par le navigateur est indicatif ; l'API détecte le vrai format.
 */
export function checkMediaFile(file: File, kind: MediaType): string | null {
  const isVideo = kind === "video";
  const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
  // Un type vide (certains OS) est laissé passer : l'API tranchera.
  if (file.type && !allowed.includes(file.type)) {
    return isVideo
      ? "Format vidéo non pris en charge (MP4 ou WebM attendu)."
      : "Format image non pris en charge (JPG, PNG ou WebP attendu).";
  }
  const max = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (file.size > max) {
    return isVideo
      ? `Cette vidéo dépasse la taille maximale autorisée (${formatBytes(max)}).`
      : `Cette image dépasse la taille maximale autorisée (${formatBytes(max)}).`;
  }
  if (file.size === 0) return "Ce fichier est vide.";
  return null;
}

/**
 * Message FR affichable pour un échec d'upload. Ne laisse JAMAIS passer une
 * erreur technique brute (stack, message axios, code HTTP) : seuls les messages
 * métier de l'API (400/413/415, rédigés en français) sont relayés.
 */
export function uploadErrorMessage(error: unknown, kind: MediaType): string {
  const e = getApiError(error);
  const objet = kind === "video" ? "vidéo" : "image";

  if (e.code === "NETWORK_ERROR" || e.status === undefined) {
    return "Connexion impossible. Vérifiez votre réseau puis réessayez.";
  }
  if (e.status === 401 || e.status === 403) {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  if (e.status === 413) {
    return kind === "video"
      ? "Cette vidéo dépasse la taille maximale autorisée."
      : "Cette image dépasse la taille maximale autorisée.";
  }
  if (e.status === 415) {
    return kind === "video"
      ? "Format vidéo non pris en charge (MP4 ou WebM attendu)."
      : "Format image non pris en charge (JPG, PNG ou WebP attendu).";
  }
  if (e.status === 400 && e.message && !/^[A-Z_]+$/.test(e.message)) {
    return e.message;
  }
  return `L'envoi de la ${objet} a échoué. Réessayez.`;
}

/** Médias d'un produit pour l'affichage : `medias` triés, sinon repli sur imageUrl/videoUrl. */
export function galleryOf(p: Pick<Produit, "medias" | "imageUrl" | "videoUrl">): ProduitMedia[] {
  if (p.medias && p.medias.length > 0) {
    return [...p.medias].sort((a, b) => a.position - b.position || a.id - b.id);
  }
  const fallback: ProduitMedia[] = [];
  if (p.imageUrl) {
    fallback.push({ id: -1, type: "image", url: p.imageUrl, posterUrl: null, mimeType: null, size: null, position: 0 });
  }
  if (p.videoUrl) {
    fallback.push({ id: -2, type: "video", url: p.videoUrl, posterUrl: null, mimeType: null, size: null, position: 1 });
  }
  return fallback;
}

/** Galerie → payload API (l'ordre du tableau = ordre d'affichage). */
export function toMediaInputs(medias: ProduitMedia[]): ProduitMediaInput[] {
  return medias.map((m) => ({
    type: m.type,
    url: m.url,
    ...(m.type === "video" ? { posterUrl: m.posterUrl } : {}),
    ...(m.mimeType ? { mimeType: m.mimeType } : {}),
    ...(m.size !== null ? { size: m.size } : {}),
  }));
}

/** Déplace l'élément `from` vers `to` (bornes respectées), sans muter. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return list;
  const target = Math.max(0, Math.min(list.length - 1, to));
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return next;
}

/** Fait de l'image `index` l'image principale = la 1ʳᵉ image de la liste (les vidéos ne bougent pas). */
export function makePrimaryImage<T extends { type: MediaType }>(list: T[], index: number): T[] {
  if (list[index]?.type !== "image") return list;
  const firstImage = list.findIndex((m) => m.type === "image");
  return firstImage === -1 || firstImage === index ? list : moveItem(list, index, firstImage);
}

/**
 * Miniature d'une vidéo, générée dans le navigateur (aucun ffmpeg côté serveur) :
 * capture d'une image proche du début. Renvoie `null` si impossible (codec non
 * décodable, timeout…) — l'appelant retombe alors sur l'image principale.
 */
export function captureVideoPoster(file: File, atSeconds = 0.5): Promise<File | null> {
  if (typeof document === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;

    const finish = (result: File | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };
    const timer = setTimeout(() => finish(null), 8000);

    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.onerror = () => finish(null);
    video.onloadedmetadata = () => {
      const d = Number.isFinite(video.duration) ? video.duration : 1;
      video.currentTime = Math.min(atSeconds, d / 2);
    };
    video.onseeked = () => {
      try {
        const scale = Math.min(1, 1280 / (video.videoWidth || 1280));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((video.videoWidth || 640) * scale));
        canvas.height = Math.max(1, Math.round((video.videoHeight || 360) * scale));
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            finish(blob ? new File([blob], "poster.jpg", { type: "image/jpeg" }) : null),
          "image/jpeg",
          0.82
        );
      } catch {
        finish(null);
      }
    };
    video.src = objectUrl;
  });
}
