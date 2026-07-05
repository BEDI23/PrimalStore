// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SousCategoriesManager from "./SousCategoriesManager";
import { renderWithClient } from "./test-utils";

// ── Fonctions mock hoistées ───────────────────────────────────────────────────
const { mockAdminList, mockCreate, mockRemove, mockCategoriesAdminList } =
  vi.hoisted(() => ({
    mockAdminList: vi.fn(),
    mockCreate: vi.fn(),
    mockRemove: vi.fn(),
    mockCategoriesAdminList: vi.fn(),
  }));

// ── Couche services ───────────────────────────────────────────────────────────
vi.mock("@/lib/api/services", () => ({
  sousCategoriesService: {
    adminList: mockAdminList,
    create: mockCreate,
    remove: mockRemove,
  },
  categoriesService: {
    adminList: mockCategoriesAdminList,
  },
}));

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockAdminList.mockReset();
  mockCreate.mockReset();
  mockRemove.mockReset();
  mockCategoriesAdminList.mockReset();
  // État vide par défaut : la liste admin renvoie un tableau vide.
  mockAdminList.mockResolvedValue([]);
  mockCategoriesAdminList.mockResolvedValue([
    { id: 1, nom: "Bien-être", slug: "bien-etre" },
  ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("SousCategoriesManager", () => {
  it("affiche l'état vide quand la liste de sous-catégories est vide", async () => {
    renderWithClient(<SousCategoriesManager />);
    // findByText attend la résolution de la query (isLoading → false).
    expect(
      await screen.findByText(/Aucune sous-catégorie/i)
    ).toBeInTheDocument();
  });

  it("refuse la création avec un nom vide — create n'est pas appelé", async () => {
    const user = userEvent.setup();
    renderWithClient(<SousCategoriesManager />);

    // Soumettre sans remplir le nom (valeur par défaut : "").
    await user.click(
      screen.getByRole("button", { name: /Créer la sous-catégorie/i })
    );

    // Message EXACT de sousCategorieSchema → nomBorne(2, 64, "Le nom doit faire entre 2 et 64 caractères.")
    expect(
      await screen.findByText("Le nom doit faire entre 2 et 64 caractères.")
    ).toBeInTheDocument();
    // Aucune mutation ne doit partir si la validation échoue.
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("crée la sous-catégorie quand tous les champs requis sont valides", async () => {
    mockCreate.mockResolvedValue({ id: 1, nom: "Compléments" });

    const user = userEvent.setup();
    renderWithClient(<SousCategoriesManager />);

    // Attendre le chargement des catégories parentes dans le Select.
    await waitFor(() => expect(mockCategoriesAdminList).toHaveBeenCalled());
    await screen.findByRole("option", { name: "Bien-être", hidden: true });

    // 1. Catégorie parente : Radix Select synchronise un <select> natif caché
    //    avec le trigger custom. jsdom ne supporte pas hasPointerCapture requis
    //    par l'ouverture du dropdown Radix ; on interagit donc avec le <select>
    //    natif accessible, ce qui déclenche le même onValueChange.
    const nativeSelect = document.querySelector("select") as HTMLSelectElement;
    await user.selectOptions(nativeSelect, "1");

    // 2. Nom (≥ 2 caractères, ≤ 64 caractères)
    await user.type(
      screen.getByPlaceholderText("Ex: Bien-être"),
      "Compléments"
    );

    // 3. Slug : généré automatiquement depuis le nom
    //    slugify("Compléments") → "complements"
    await user.click(screen.getByRole("button", { name: /Générer/i }));

    // 4. Soumettre le formulaire
    await user.click(
      screen.getByRole("button", { name: /Créer la sous-catégorie/i })
    );

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          categorieId: 1,
          nom: "Compléments",
          slug: "complements",
        })
      )
    );
  });
});
