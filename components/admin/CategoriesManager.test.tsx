// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesManager from "./CategoriesManager";
import { renderWithClient } from "./test-utils";

// ── Fonctions mock hoistées ───────────────────────────────────────────────────
const { mockAdminList, mockCreate, mockUpdate, mockRemove, mockUpload } =
  vi.hoisted(() => ({
    mockAdminList: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockRemove: vi.fn(),
    mockUpload: vi.fn(),
  }));

// Catégorie existante utilisée pour les tests d'édition.
const CATEGORIE_EXISTANTE = {
  id: 7,
  nom: "Bien-être",
  slug: "bien-etre",
  description: null,
  theme: {
    primary: "#ed4c20",
    primaryHover: "#c53a14",
    onPrimary: "#ffffff",
    secondary: "#ffa500",
    accent: "#00bfff",
  },
  iconName: "leaf",
  coverImageUrl: "https://cdn.test/bien-etre.jpg",
  isAdult: false,
  position: 2,
  actif: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

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
    update: mockUpdate,
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
  mockUpdate.mockReset();
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

    // Ouvrir le modal.
    await user.click(screen.getByRole("button", { name: /Nouvelle catégorie/i }));

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
    renderWithClient(<CategoriesManager />);

    // Ouvrir le modal.
    await user.click(screen.getByRole("button", { name: /Nouvelle catégorie/i }));

    // 1. Nom (≥ 2 caractères, ≤ 64 caractères)
    await user.type(screen.getByPlaceholderText("Ex: Bien-être"), "Cosmétiques");

    // 2. Slug : généré automatiquement depuis le nom
    //    slugify("Cosmétiques") → "cosmetiques"
    await user.click(screen.getByRole("button", { name: /Générer/i }));

    // 3. Image de couverture : simulation d'un upload de fichier
    //    Le composant lit e.target.files[0] et appelle upload.mutateAsync.
    // Le formulaire est monté dans un portail (Dialog) : la requête se fait
    // sur document.body plutôt que sur le container de rendu local.
    const fileInput = document.body.querySelector(
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

  it("pré-remplit le formulaire avec la catégorie à modifier", async () => {
    mockAdminList.mockResolvedValue([CATEGORIE_EXISTANTE]);
    const user = userEvent.setup();
    renderWithClient(<CategoriesManager />);

    await user.click(
      await screen.findByRole("button", { name: /Modifier Bien-être/i })
    );

    expect(
      screen.getByRole("heading", { name: /Modifier la catégorie/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Bien-être")).toHaveValue(
      "Bien-être"
    );
    expect(screen.getByPlaceholderText("bien-etre")).toHaveValue("bien-etre");
    expect(screen.getByAltText("Aperçu couverture")).toHaveAttribute(
      "src",
      "https://cdn.test/bien-etre.jpg"
    );
  });

  it("met à jour la catégorie via update (et non create)", async () => {
    mockAdminList.mockResolvedValue([CATEGORIE_EXISTANTE]);
    mockUpdate.mockResolvedValue({ ...CATEGORIE_EXISTANTE, nom: "Détente" });
    const user = userEvent.setup();
    renderWithClient(<CategoriesManager />);

    await user.click(
      await screen.findByRole("button", { name: /Modifier Bien-être/i })
    );

    const nomInput = screen.getByPlaceholderText("Ex: Bien-être");
    await user.clear(nomInput);
    await user.type(nomInput, "Détente");

    await user.click(
      screen.getByRole("button", { name: /Enregistrer les modifications/i })
    );

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          nom: "Détente",
          slug: "bien-etre",
          iconName: "leaf",
          coverImageUrl: "https://cdn.test/bien-etre.jpg",
          position: 2,
        })
      )
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("réaffiche un formulaire vide en création après une édition annulée", async () => {
    mockAdminList.mockResolvedValue([CATEGORIE_EXISTANTE]);
    const user = userEvent.setup();
    renderWithClient(<CategoriesManager />);

    await user.click(
      await screen.findByRole("button", { name: /Modifier Bien-être/i })
    );
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: /Nouvelle catégorie/i }));

    expect(
      screen.getByRole("heading", { name: /Nouvelle catégorie/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Bien-être")).toHaveValue("");
  });
});
