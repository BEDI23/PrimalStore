// @vitest-environment jsdom
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ProduitMediaInput } from "@/lib/api/types";

const mutateAsync = vi.fn();
vi.mock("@/lib/api/hooks/use-uploads", () => ({ useUpload: () => ({ mutateAsync }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// jsdom ne décode pas de vidéo : la capture de miniature est simulée.
vi.mock("@/lib/media", async (orig) => ({
  ...(await orig<typeof import("@/lib/media")>()),
  captureVideoPoster: vi.fn().mockResolvedValue(new File(["x"], "poster.jpg", { type: "image/jpeg" })),
}));

import ProduitMediaManager from "./ProduitMediaManager";

const img = (n: number): ProduitMediaInput => ({ type: "image", url: `https://cdn.test/i${n}.jpg` });
const vid: ProduitMediaInput = { type: "video", url: "https://cdn.test/v.mp4", posterUrl: null };

/** Harnais contrôlé : reproduit le câblage react-hook-form (valeur remontée puis redescendue). */
function Harness({ initial, spy }: { initial: ProduitMediaInput[]; spy?: (v: ProduitMediaInput[]) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <ProduitMediaManager
      value={value}
      onChange={(v) => {
        setValue(v);
        spy?.(v);
      }}
    />
  );
}

const pick = (label: string, file: File) =>
  fireEvent.change(screen.getByLabelText(label), { target: { files: [file] } });
const fileOf = (name: string, type: string, size = 100) => {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

beforeEach(() => {
  mutateAsync.mockReset();
});

describe("ProduitMediaManager", () => {
  it("état vide : invite à ajouter au moins une image", () => {
    render(<Harness initial={[]} />);
    expect(screen.getByText(/Aucun média pour l'instant/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ajouter des images/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Ajouter une vidéo/ })).toBeEnabled();
  });

  it("affiche l'image principale, la vidéo (▶) et les compteurs", () => {
    render(<Harness initial={[img(1), img(2), vid]} />);
    expect(screen.getByText("Principale")).toBeInTheDocument();
    expect(screen.getByText(/2\/10 images · 1\/3 vidéo/)).toBeInTheDocument();
    expect(screen.getByLabelText("Prévisualiser la vidéo")).toBeInTheDocument();
    expect(screen.getByLabelText("Remplacer la vidéo")).toBeInTheDocument();
  });

  it("ajout d'une vidéo : upload dans le bucket videos, ajoutée à la galerie, miniature rattachée", async () => {
    const spy = vi.fn();
    mutateAsync.mockImplementation(async ({ bucket }: { bucket: string }) =>
      bucket === "videos"
        ? { publicUrl: "https://cdn.test/new.mp4", mimeType: "video/mp4", size: 1234 }
        : { publicUrl: "https://cdn.test/poster.jpg", mimeType: "image/jpeg", size: 10 }
    );
    render(<Harness initial={[img(1)]} spy={spy} />);

    pick("Choisir une vidéo", fileOf("clip.mp4", "video/mp4"));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2)); // vidéo + poster
    expect(mutateAsync.mock.calls[0][0]).toMatchObject({ bucket: "videos" });
    expect(mutateAsync.mock.calls[1][0]).toMatchObject({ bucket: "produits" });
    await waitFor(() => {
      const last = spy.mock.calls.at(-1)![0] as ProduitMediaInput[];
      expect(last).toEqual([
        img(1),
        { type: "video", url: "https://cdn.test/new.mp4", posterUrl: "https://cdn.test/poster.jpg", mimeType: "video/mp4", size: 1234 },
      ]);
    });
  });

  it("vidéo trop lourde ou mauvais format : refus immédiat, message lisible, aucun envoi", async () => {
    render(<Harness initial={[img(1)]} />);

    pick("Choisir une vidéo", fileOf("gros.mp4", "video/mp4", 80 * 1024 * 1024));
    expect(await screen.findByText(/Cette vidéo dépasse la taille maximale autorisée/)).toBeInTheDocument();

    pick("Choisir une vidéo", fileOf("film.mov", "video/quicktime"));
    expect(await screen.findByText(/Format vidéo non pris en charge/)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("erreur serveur : message FR, jamais l'erreur technique brute ; la galerie reste inchangée", async () => {
    const spy = vi.fn();
    mutateAsync.mockRejectedValue(new Error("ECONNRESET at TCP.onStreamRead"));
    render(<Harness initial={[img(1)]} spy={spy} />);

    pick("Choisir une vidéo", fileOf("clip.mp4", "video/mp4"));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).not.toMatch(/ECONNRESET|TCP/);
    expect(alert.textContent).toMatch(/Connexion impossible|a échoué/);
    expect(spy).not.toHaveBeenCalled();
  });

  it("suppression et réordonnancement", () => {
    const spy = vi.fn();
    render(<Harness initial={[img(1), img(2), vid]} spy={spy} />);

    fireEvent.click(screen.getByLabelText("Définir l'image 2 comme image principale"));
    expect((spy.mock.calls.at(-1)![0] as ProduitMediaInput[]).map((m) => m.url)).toEqual([
      "https://cdn.test/i2.jpg",
      "https://cdn.test/i1.jpg",
      "https://cdn.test/v.mp4",
    ]);

    fireEvent.click(screen.getByLabelText("Supprimer la vidéo"));
    expect((spy.mock.calls.at(-1)![0] as ProduitMediaInput[]).map((m) => m.type)).toEqual(["image", "image"]);
  });

  it("prévisualisation d'une vidéo existante (contrôles natifs, sans autoplay)", () => {
    render(<Harness initial={[img(1), vid]} />);
    fireEvent.click(screen.getByLabelText("Prévisualiser la vidéo"));
    const video = document.querySelector("video") as HTMLVideoElement;
    expect(video).toHaveAttribute("controls");
    expect(video.autoplay).toBe(false);
    expect(video.getAttribute("preload")).toBe("metadata");
  });

  it("plafond atteint : les boutons d'ajout sont désactivés", () => {
    const many = Array.from({ length: 10 }, (_, i) => img(i));
    render(<Harness initial={[...many, vid, { ...vid, url: "b" }, { ...vid, url: "c" }]} />);
    expect(screen.getByRole("button", { name: /Ajouter des images/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Ajouter une vidéo/ })).toBeDisabled();
  });
});
