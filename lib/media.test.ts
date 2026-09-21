import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import {
  checkMediaFile,
  formatBytes,
  galleryOf,
  makePrimaryImage,
  moveItem,
  toMediaInputs,
  uploadErrorMessage,
} from "./media";
import type { ProduitMedia } from "@/lib/api/types";

/** Fichier factice dont la taille annoncée est `size` (sans allouer le contenu). */
const fakeFile = (type: string, size: number) => {
  const f = new File([new Uint8Array(1)], "f", { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};
const media = (o: Partial<ProduitMedia>): ProduitMedia => ({
  id: 1,
  type: "image",
  url: "https://x/a.jpg",
  posterUrl: null,
  mimeType: null,
  size: null,
  position: 0,
  ...o,
});
const apiError = (status: number, message = "x", code = "VALIDATION_FAILED") =>
  new AxiosError("boom", "ERR", undefined, null, {
    status,
    statusText: "",
    headers: {},
    config: {} as never,
    data: { error: { code, message } },
  });

describe("formatBytes", () => {
  it("formate o / Ko / Mo", () => {
    expect(formatBytes(512)).toBe("512 o");
    expect(formatBytes(2048)).toBe("2 Ko");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1,5 Mo");
  });
});

describe("checkMediaFile", () => {
  it("accepte MP4/WebM et JPG/PNG/WebP dans la limite", () => {
    expect(checkMediaFile(fakeFile("video/mp4", 1000), "video")).toBeNull();
    expect(checkMediaFile(fakeFile("video/webm", 1000), "video")).toBeNull();
    expect(checkMediaFile(fakeFile("image/webp", 1000), "image")).toBeNull();
  });

  it("refuse un format non pris en charge (QuickTime, GIF, mauvais type)", () => {
    expect(checkMediaFile(fakeFile("video/quicktime", 1000), "video")).toBe(
      "Format vidéo non pris en charge (MP4 ou WebM attendu)."
    );
    expect(checkMediaFile(fakeFile("image/gif", 1000), "image")).toMatch(/Format image non pris en charge/);
    expect(checkMediaFile(fakeFile("image/png", 1000), "video")).toMatch(/Format vidéo/);
  });

  it("refuse une vidéo/image trop volumineuse avec un message lisible", () => {
    expect(checkMediaFile(fakeFile("video/mp4", 60 * 1024 * 1024), "video")).toBe(
      "Cette vidéo dépasse la taille maximale autorisée (50,0 Mo)."
    );
    expect(checkMediaFile(fakeFile("image/jpeg", 11 * 1024 * 1024), "image")).toMatch(/Cette image dépasse/);
  });

  it("laisse passer un type vide (l'API tranche) mais refuse un fichier vide", () => {
    expect(checkMediaFile(fakeFile("", 1000), "video")).toBeNull();
    expect(checkMediaFile(fakeFile("video/mp4", 0), "video")).toBe("Ce fichier est vide.");
  });
});

describe("uploadErrorMessage — jamais d'erreur technique brute", () => {
  it("réseau coupé", () => {
    expect(uploadErrorMessage(new AxiosError("Network Error", "ERR_NETWORK"), "video")).toMatch(
      /Connexion impossible/
    );
  });

  it("413 / 415 / 401 / 500", () => {
    expect(uploadErrorMessage(apiError(413), "video")).toBe("Cette vidéo dépasse la taille maximale autorisée.");
    expect(uploadErrorMessage(apiError(415), "video")).toBe("Format vidéo non pris en charge (MP4 ou WebM attendu).");
    expect(uploadErrorMessage(apiError(401, "UNAUTHENTICATED", "UNAUTHENTICATED"), "image")).toMatch(
      /session a expiré/
    );
    const msg = uploadErrorMessage(apiError(500, "TypeError: cannot read x", "INTERNAL_ERROR"), "video");
    expect(msg).toBe("L'envoi de la vidéo a échoué. Réessayez.");
    expect(msg).not.toMatch(/TypeError/);
  });

  it("400 : relaie le message métier FR mais pas un code brut", () => {
    expect(uploadErrorMessage(apiError(400, "Aucun fichier reçu."), "image")).toBe("Aucun fichier reçu.");
    expect(uploadErrorMessage(apiError(400, "VALIDATION_FAILED"), "image")).toBe(
      "L'envoi de la image a échoué. Réessayez."
    );
  });

  it("erreur non-axios", () => {
    expect(uploadErrorMessage(new Error("kaboom"), "image")).toMatch(/Connexion impossible|a échoué/);
  });
});

describe("galleryOf", () => {
  it("trie par position", () => {
    const g = galleryOf({
      imageUrl: "i",
      videoUrl: null,
      medias: [media({ id: 2, position: 1, url: "b" }), media({ id: 1, position: 0, url: "a" })],
    });
    expect(g.map((m) => m.url)).toEqual(["a", "b"]);
  });

  it("repli sur imageUrl/videoUrl quand aucune ligne de média", () => {
    const g = galleryOf({ imageUrl: "https://x/i.jpg", videoUrl: "https://x/v.mp4", medias: [] });
    expect(g.map((m) => [m.type, m.url])).toEqual([
      ["image", "https://x/i.jpg"],
      ["video", "https://x/v.mp4"],
    ]);
    expect(galleryOf({ imageUrl: "https://x/i.jpg", videoUrl: null })).toHaveLength(1);
  });
});

describe("ordre et image principale", () => {
  const list = [
    { type: "video" as const, url: "v" },
    { type: "image" as const, url: "a" },
    { type: "image" as const, url: "b" },
  ];

  it("moveItem borne et ne mute pas", () => {
    expect(moveItem(list, 0, 5).map((m) => m.url)).toEqual(["a", "b", "v"]);
    expect(moveItem(list, 2, 0).map((m) => m.url)).toEqual(["b", "v", "a"]);
    expect(list[0].url).toBe("v");
  });

  it("makePrimaryImage : l'image passe devant la 1ʳᵉ image ; une vidéo ne peut pas être principale", () => {
    expect(makePrimaryImage(list, 2).map((m) => m.url)).toEqual(["v", "b", "a"]);
    expect(makePrimaryImage(list, 0)).toBe(list);
    expect(makePrimaryImage(list, 1)).toBe(list);
  });

  it("toMediaInputs : poster seulement pour les vidéos", () => {
    const out = toMediaInputs([
      media({ url: "a" }),
      media({ type: "video", url: "v", posterUrl: "p", mimeType: "video/mp4", size: 5 }),
    ]);
    expect(out[0]).toEqual({ type: "image", url: "a" });
    expect(out[1]).toEqual({ type: "video", url: "v", posterUrl: "p", mimeType: "video/mp4", size: 5 });
  });
});
