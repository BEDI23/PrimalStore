// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommandeForm from "./CommandeForm";
import { formatPrix } from "@/lib/utils";
import { LAST_COMMANDE_STORAGE_KEY } from "@/lib/constants";
import type { Commande, Produit } from "@/lib/api/types";

// formatPrix utilise une espace fine insécable (U+202F) comme séparateur de
// milliers ; RTL normalise tout espace en espace normale dans le DOM. On aligne
// le needle sur cette normalisation pour comparer correctement.
const prixTexte = (n: number) => formatPrix(n).replace(/\s/g, " ");

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn(), back: vi.fn() }),
}));

// Mock du hook useCreateCommande
const mutateMock = vi.fn();
vi.mock("@/lib/api/hooks", () => ({
  useCreateCommande: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

const produit: Produit = {
  id: 1,
  nom: "Huile essentielle",
  slug: "huile-essentielle",
  prix: 1000,
  descriptionCourte: "Description courte",
  descriptionLongue: "Description longue",
  badge: null,
  imageUrl: "https://example.com/image.jpg",
  videoUrl: null,
  sousCategorieId: 1,
  actif: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  promotion: null,
};

beforeEach(() => {
  push.mockReset();
  mutateMock.mockReset();
  sessionStorage.clear();
});

describe("CommandeForm", () => {
  it("affiche le prix total et le recalcule de façon réactive", async () => {
    const user = userEvent.setup();
    render(<CommandeForm produit={produit} />);

    // Prix initial (quantité = 1).
    expect(screen.getByText(prixTexte(1000))).toBeInTheDocument();

    const quantite = screen.getByLabelText(/Quantité/i);
    await user.clear(quantite);
    await user.type(quantite, "3");

    // Le prix suit la quantité sans soumission (watch réactif).
    await waitFor(() =>
      expect(screen.getByText(prixTexte(3000))).toBeInTheDocument()
    );
  });

  it("affiche le prixPromo si une promotion est active", () => {
    const produitEnPromo: Produit = {
      ...produit,
      promotion: { prixPromo: 750, dateFin: "2099-12-31T00:00:00Z" },
    };
    render(<CommandeForm produit={produitEnPromo} />);
    expect(screen.getByText(prixTexte(750))).toBeInTheDocument();
  });

  it("affiche une erreur de téléphone réactive après blur (onTouched)", async () => {
    const user = userEvent.setup();
    render(<CommandeForm produit={produit} />);

    const tel = screen.getByLabelText(/Téléphone/i);
    await user.type(tel, "0123");
    await user.tab(); // blur → déclenche la validation onTouched

    expect(
      await screen.findByText("Numéro invalide. Format attendu : +228XXXXXXXX")
    ).toBeInTheDocument();
  });

  it("n'envoie pas la commande quand le formulaire est invalide", async () => {
    const user = userEvent.setup();
    render(<CommandeForm produit={produit} />);

    await user.click(screen.getByRole("button", { name: /Commander maintenant/i }));

    expect(
      await screen.findByText("Le nom complet est obligatoire.")
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("appelle createCommande avec les valeurs camelCase + prixAttendu quand tout est valide", async () => {
    const user = userEvent.setup();
    render(<CommandeForm produit={produit} />);

    await user.type(screen.getByLabelText(/Nom complet/i), "Awa Koffi");
    await user.type(screen.getByLabelText(/Téléphone/i), "+22890123456");
    await user.type(screen.getByLabelText(/Quartier/i), "Adidogomé");
    const quantite = screen.getByLabelText(/Quantité/i);
    await user.clear(quantite);
    await user.type(quantite, "2");

    await user.click(screen.getByRole("button", { name: /Commander maintenant/i }));

    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1));

    const [input] = mutateMock.mock.calls[0];
    expect(input).toMatchObject({
      produitId: 1,
      clientNom: "Awa Koffi",
      clientTelephone: "+22890123456",
      quartier: "Adidogomé",
      quantite: 2,
      prixAttendu: 1000,
    });
  });

  it("redirige vers /confirmation après succès et sauvegarde la commande en sessionStorage", async () => {
    const commandeCreee: Commande = {
      id: 843,
      produitId: 1,
      produitNom: "Huile essentielle",
      produitPrix: 1000,
      clientNom: "Awa Koffi",
      clientTelephone: "+22890123456",
      quartier: "Adidogomé",
      quantite: 1,
      prixTotal: 1000,
      message: null,
      statut: "nouvelle",
      createdAt: "2026-07-21T10:00:00.000Z",
    };
    mutateMock.mockImplementation((_input, { onSuccess }) =>
      onSuccess(commandeCreee)
    );
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const user = userEvent.setup();
    render(<CommandeForm produit={produit} />);

    await user.type(screen.getByLabelText(/Nom complet/i), "Awa Koffi");
    await user.type(screen.getByLabelText(/Téléphone/i), "+22890123456");
    await user.type(screen.getByLabelText(/Quartier/i), "Adidogomé");

    await user.click(screen.getByRole("button", { name: /Commander maintenant/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/confirmation"));
    expect(setItemSpy).toHaveBeenCalledWith(
      LAST_COMMANDE_STORAGE_KEY,
      JSON.stringify(commandeCreee)
    );

    setItemSpy.mockRestore();
  });
});
