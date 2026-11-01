// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithClient } from "./test-utils";

// Polyfill ResizeObserver (Radix Select) pour jsdom.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// ── Fonctions mock hoistées ───────────────────────────────────────────────────
const {
  mockPush,
  mockRefresh,
  mockCategoriesAdminList,
  mockSousCategoriesAdminList,
  mockSousCategorieById,
  mockProduitById,
  mockProduitCreate,
  mockProduitUpdate,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockCategoriesAdminList: vi.fn(),
  mockSousCategoriesAdminList: vi.fn(),
  mockSousCategorieById: vi.fn(),
  mockProduitById: vi.fn(),
  mockProduitCreate: vi.fn(),
  mockProduitUpdate: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, back: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api/services", () => ({
  categoriesService: { adminList: mockCategoriesAdminList },
  sousCategoriesService: {
    adminList: mockSousCategoriesAdminList,
    adminById: mockSousCategorieById,
  },
  produitsService: {
    adminById: mockProduitById,
    create: mockProduitCreate,
    update: mockProduitUpdate,
  },
  uploadsService: { upload: vi.fn() },
  ageService: { confirm: vi.fn() },
}));

import ProduitForm from "./ProduitForm";

// Produit existant utilisé pour les tests d'édition.
const PRODUIT_EXISTANT = {
  id: 42,
  nom: "Huile de massage",
  slug: "huile-de-massage",
  prix: 5000,
  descriptionCourte: "Huile relaxante",
  descriptionLongue: "Huile relaxante aux huiles essentielles.",
  badge: null,
  imageUrl: "https://cdn.test/huile.jpg",
  videoUrl: null,
  sousCategorieId: 12,
  actif: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  medias: [
    {
      id: 1,
      type: "image",
      url: "https://cdn.test/huile.jpg",
      posterUrl: null,
      mimeType: "image/jpeg",
      size: 1234,
      position: 0,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockCategoriesAdminList.mockResolvedValue([
    { id: 1, nom: "Bien-être", slug: "bien-etre" },
  ]);
  mockSousCategoriesAdminList.mockResolvedValue([
    { id: 12, categorieId: 1, nom: "Massage", slug: "massage" },
  ]);
  mockSousCategorieById.mockResolvedValue({
    id: 12,
    categorieId: 1,
    nom: "Massage",
    slug: "massage",
  });
  mockProduitById.mockResolvedValue(PRODUIT_EXISTANT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("ProduitForm (édition)", () => {
  it("pré-remplit le formulaire avec le produit à modifier", async () => {
    renderWithClient(<ProduitForm produitId={42} />);

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: /^Nom/ })).toHaveValue(
        "Huile de massage"
      )
    );
    expect(screen.getByRole("spinbutton", { name: /Prix/ })).toHaveValue(5000);
    expect(
      screen.getByRole("textbox", { name: /Description courte/ })
    ).toHaveValue("Huile relaxante");
    expect(
      screen.getByRole("button", { name: /Mettre à jour/ })
    ).toBeInTheDocument();
  });

  it("met à jour le produit via update (et non create)", async () => {
    mockProduitUpdate.mockResolvedValue({ ...PRODUIT_EXISTANT, prix: 6500 });
    const user = userEvent.setup();
    renderWithClient(<ProduitForm produitId={42} />);

    const prix = screen.getByRole("spinbutton", { name: /Prix/ });
    await waitFor(() => expect(prix).toHaveValue(5000));

    await user.clear(prix);
    await user.type(prix, "6500");
    await user.click(screen.getByRole("button", { name: /Mettre à jour/ }));

    await waitFor(() =>
      expect(mockProduitUpdate).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          nom: "Huile de massage",
          prix: 6500,
          sousCategorieId: 12,
          actif: true,
          badge: null,
          medias: [
            expect.objectContaining({
              type: "image",
              url: "https://cdn.test/huile.jpg",
            }),
          ],
        })
      )
    );
    expect(mockProduitCreate).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/admin/produits");
  });
});
