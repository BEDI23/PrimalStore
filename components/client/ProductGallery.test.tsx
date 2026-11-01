// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ProductGallery, { type GalleryItem } from "./ProductGallery";

const img = (n: number): GalleryItem => ({
  id: n,
  type: "image",
  url: `https://cdn.test/i${n}.jpg`,
  posterUrl: null,
});
const vid = (n: number, poster: string | null = null): GalleryItem => ({
  id: n,
  type: "video",
  url: `https://cdn.test/v${n}.mp4`,
  posterUrl: poster,
});

// jsdom n'implémente pas la lecture média : on espionne play/pause.
const playMock = vi.fn();
const pauseMock = vi.fn();
beforeEach(() => {
  playMock.mockReset().mockResolvedValue(undefined);
  pauseMock.mockReset();
  HTMLMediaElement.prototype.play = playMock;
  HTMLMediaElement.prototype.pause = pauseMock;
});

describe("ProductGallery", () => {
  it("article sans média : repli visuel, aucun contrôle de galerie", () => {
    render(<ProductGallery nom="Huile" items={[]} />);
    expect(screen.getByRole("img", { name: "Huile" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Média suivant")).toBeNull();
  });

  it("une seule image : pas de flèches ni de miniatures", () => {
    render(<ProductGallery nom="Huile" items={[img(1)]} />);
    expect(screen.queryByLabelText("Média suivant")).toBeNull();
    expect(screen.queryByLabelText("Miniatures des médias")).toBeNull();
  });

  it("plusieurs images : navigation par flèches (circulaire) et miniatures", () => {
    render(<ProductGallery nom="Huile" items={[img(1), img(2), img(3)]} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Média suivant"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Média précédent"));
    fireEvent.click(screen.getByLabelText("Média précédent"));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Afficher l'image 2"));
    expect(screen.getByLabelText("Afficher l'image 2")).toHaveAttribute("aria-current", "true");
  });

  it("navigation clavier ←/→ sur la scène", () => {
    render(<ProductGallery nom="Huile" items={[img(1), img(2)]} />);
    const stage = screen.getByRole("region").querySelector("[tabindex='0']") as HTMLElement;
    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("la sélection initiale est l'image principale, même si une vidéo est en tête de galerie", () => {
    render(<ProductGallery nom="Huile" items={[vid(9), img(1), img(2)]} />);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(screen.queryByLabelText("Lire la vidéo de Huile")).toBeNull();
    expect(screen.getByLabelText("Afficher la vidéo")).toBeInTheDocument();
  });

  it("aucune balise <video> tant que la vidéo n'est pas sélectionnée (page rapide)", () => {
    render(<ProductGallery nom="Huile" items={[img(1), vid(9)]} />);
    expect(document.querySelector("video")).toBeNull();
  });

  it("sélectionner la vidéo la joue dans le cadre principal : autoplay, muette, en boucle, inline", () => {
    render(<ProductGallery nom="Huile" items={[img(1), vid(9, "https://cdn.test/p.jpg")]} />);
    fireEvent.click(screen.getByLabelText("Afficher la vidéo"));

    const videos = document.querySelectorAll("video");
    expect(videos).toHaveLength(1);
    const video = videos[0] as HTMLVideoElement;
    expect(video.getAttribute("src")).toBe("https://cdn.test/v9.mp4");
    expect(video.autoplay).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video).not.toHaveAttribute("controls");
    expect(video).toHaveAttribute("poster", "https://cdn.test/p.jpg");
    expect(playMock).toHaveBeenCalled();
    // Pastille « Vidéo » sur la scène + libellé de la miniature.
    expect(screen.getAllByText("Vidéo")).toHaveLength(2);
    expect(screen.queryByRole("dialog")).toBeNull();

    // Retour à l'image : plus aucune vidéo montée.
    fireEvent.click(screen.getByLabelText("Afficher l'image 1"));
    expect(document.querySelector("video")).toBeNull();
  });

  it("passer d'une vidéo à l'autre ne garde qu'un seul <video> à la fois", () => {
    render(<ProductGallery nom="Huile" items={[img(1), vid(8), vid(9)]} />);
    const thumbs = screen.getAllByLabelText("Afficher la vidéo");
    fireEvent.click(thumbs[0]);
    expect(document.querySelectorAll("video")).toHaveLength(1);
    fireEvent.click(thumbs[1]);
    const videos = document.querySelectorAll("video");
    expect(videos).toHaveLength(1);
    expect(videos[0].getAttribute("src")).toBe("https://cdn.test/v9.mp4");
  });

  it("pause / son : les commandes agissent sur la lecture inline", () => {
    render(<ProductGallery nom="Huile" items={[img(1), vid(9)]} />);
    fireEvent.click(screen.getByLabelText("Afficher la vidéo"));
    const video = document.querySelector("video") as HTMLVideoElement;

    fireEvent.click(screen.getByLabelText("Mettre la vidéo en pause"));
    expect(pauseMock).toHaveBeenCalled();
    expect(screen.getAllByLabelText("Lire la vidéo").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByLabelText("Lire la vidéo")[0]);
    expect(screen.getByLabelText("Mettre la vidéo en pause")).toBeInTheDocument();

    expect(video.muted).toBe(true);
    fireEvent.click(screen.getByLabelText("Activer le son"));
    expect(video.muted).toBe(false);
    expect(screen.getByLabelText("Couper le son")).toBeInTheDocument();
  });

  it("autoplay refusé par le navigateur : bouton ▶ visible, aucune erreur", async () => {
    playMock.mockRejectedValueOnce(new DOMException("blocked", "NotAllowedError"));
    render(<ProductGallery nom="Huile" items={[img(1), vid(9)]} />);
    fireEvent.click(screen.getByLabelText("Afficher la vidéo"));
    expect((await screen.findAllByLabelText("Lire la vidéo")).length).toBeGreaterThan(0);
  });

  it("« Agrandir » ouvre le lecteur plein écran (avec contrôles) et met la lecture inline en pause ; Fermer / Échap → retour", () => {
    render(<ProductGallery nom="Huile" items={[img(1), vid(9, "https://cdn.test/p.jpg")]} />);
    fireEvent.click(screen.getByLabelText("Afficher la vidéo"));
    fireEvent.click(screen.getByLabelText("Agrandir la vidéo"));

    const dialog = screen.getByRole("dialog");
    const viewer = dialog.querySelector("video") as HTMLVideoElement;
    expect(viewer).not.toBeNull();
    expect(viewer.getAttribute("src")).toBe("https://cdn.test/v9.mp4");
    expect(viewer).toHaveAttribute("controls");
    expect(viewer.autoplay).toBe(false);
    expect(pauseMock).toHaveBeenCalled();

    fireEvent.click(within(dialog).getByLabelText("Fermer la vidéo"));
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByLabelText("Agrandir la vidéo"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("vidéo en échec : retour automatique à l'image principale (plus de <video>)", () => {
    render(<ProductGallery nom="Huile" items={[img(1), vid(9)]} />);
    fireEvent.click(screen.getByLabelText("Afficher la vidéo"));
    fireEvent.error(document.querySelector("video") as HTMLVideoElement);

    expect(document.querySelector("video")).toBeNull();
    expect(screen.getByText("Vidéo indisponible")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Huile" })).toBeInTheDocument();
    // La miniature reste sélectionnable : l'utilisateur peut revenir aux images.
    fireEvent.click(screen.getByLabelText("Afficher l'image 1"));
    expect(screen.queryByText("Vidéo indisponible")).toBeNull();
  });

  it("images placeholder ignorées ; si tout est placeholder → repli", () => {
    render(
      <ProductGallery
        nom="Huile"
        items={[{ id: 1, type: "image", url: "https://placehold.co/600x600", posterUrl: null }]}
      />
    );
    expect(screen.getByRole("img", { name: "Huile" })).toBeInTheDocument();
  });
});
