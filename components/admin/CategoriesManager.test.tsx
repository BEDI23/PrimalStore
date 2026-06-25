// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesManager from "./CategoriesManager";
import { renderWithClient } from "./test-utils";

// ── Fonctions mock hoistées ───────────────────────────────────────────────────
const { mockAdminList, mockCreate, mockRemove, mockUpload } = vi.hoisted(() => ({
  mockAdminList: vi.fn(),
  mockCreate: vi.fn(),
  mockRemove: vi.fn(),
  mockUpload: vi.fn(),
}));

// ── next/image (stub minimal : <Image> → <img>) ───────────────────────────────
// next/image utilise des API non disponibles en jsdom (IntersectionObserver,
// src optimizer) ; on le remplace par un <img> simple pour les tests.
vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
  }: {
    src?: string;
    alt?: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} />;
  },
}));

// ── Couche services ───────────────────────────────────────────────────────────
vi.mock("@/lib/api/services", () => ({
  categoriesService: {
    adminList: mockAdminList,
    create: mockCreate,
    remove: mockRemove,
  },
  uploadsService: { upload: mockUpload },
  // ageService est importé par use-uploads → doit être présent même sans être testé.
  ageService: { confirm: vi.fn() },
}));

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockAdminList.mockReset();
  mockCreate.mockReset();
  mockUpload.mockReset();
  // État vide par défaut : la liste admin renvoie un tableau vide.
  mockAdminList.mockResolvedValue([]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("CategoriesManager", () => {
  it("affiche l'état vide quand la liste de catégories est vide", async () => {
    renderWithClient(<CategoriesManager />);
    // findByText attend la résolution de la query (isLoading → false).
    expect(
      await screen.findByText(/Aucune catégorie/i)
    ).toBeInTheDocument();
  });

  it("refuse la création avec un nom vide — create n'est pas appelé", async () => {
    const user = userEvent.setup();
    renderWithClient(<CategoriesManager />);

    // Soumettre sans remplir le nom (valeur par défaut : "").
    await user.click(screen.getByRole("button", { name: /Créer la catégorie/i }));

    // Message EXACT de categorieSchema → nomBorne(2, 64, "Le nom doit faire entre 2 et 64 caractères.")
    expect(
      await screen.findByText("Le nom doit faire entre 2 et 64 caractères.")
    ).toBeInTheDocument();
    // Aucune mutation ne doit partir si la validation échoue.
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("crée la catégorie quand tous les champs requis sont valides", async () => {
    mockCreate.mockResolvedValue({ id: 1, nom: "Cosmétiques" });
    mockUpload.mockResolvedValue({
      path: "categories/x.jpg",
      publicUrl: "https://cdn.test/x.jpg",
    });

    const user = userEvent.setup();
    const { container } = renderWithClient(<CategoriesManager />);

    // 1. Nom (≥ 2 caractères, ≤ 64 caractères)
    await user.type(screen.getByPlaceholderText("Ex: Bien-être"), "Cosmétiques");

    // 2. Slug : généré automatiquement depuis le nom
    //    slugify("Cosmétiques") → "cosmetiques"
    await user.click(screen.getByRole("button", { name: /Générer/i }));

    // 3. Image de couverture : simulation d'un upload de fichier
    //    Le composant lit e.target.files[0] et appelle upload.mutateAsync.
    const fileInput = container.querySelector(
      "input[type='file']"
    ) as HTMLInputElement;
    await user.upload(
      fileInput,
      new File(["content"], "cover.jpg", { type: "image/jpeg" })
    );

    // Attendre que la mutation upload soit résolue et que setValue("coverImageUrl")
    // ait déclenché le re-rendu (l'aperçu Image s'affiche).
    await screen.findByAltText("Aperçu couverture");

    // 4. Soumettre le formulaire
    await user.click(screen.getByRole("button", { name: /Créer la catégorie/i }));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: "Cosmétiques",
          slug: "cosmetiques",
          coverImageUrl: "https://cdn.test/x.jpg",
        })
      )
    );
  });
});
