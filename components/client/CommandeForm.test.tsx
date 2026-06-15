// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommandeForm from "./CommandeForm";
import { formatPrix } from "@/lib/utils";
import type { ProduitAvecPromo } from "@/lib/types";

// formatPrix utilise une espace fine insécable (U+202F) comme séparateur de
// milliers ; RTL normalise tout espace en espace normale dans le DOM. On aligne
// le needle sur cette normalisation pour comparer correctement.
const prixTexte = (n: number) => formatPrix(n).replace(/\s/g, " ");

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn(), back: vi.fn() }),
}));

const produit = {
  id: "prod-1",
  nom: "Huile essentielle",
  prix: 1000,
  prixFinal: 1000,
  enPromo: false,
} as unknown as ProduitAvecPromo;

beforeEach(() => {
  push.mockReset();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  }) as unknown as typeof fetch;
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

    await user.click(screen.getByRole("button", { name: /Envoyer ma commande/i }));

    expect(
      await screen.findByText("Le nom complet est obligatoire.")
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("envoie la commande et redirige quand tout est valide", async () => {
    const user = userEvent.setup();
    render(<CommandeForm produit={produit} />);

    await user.type(screen.getByLabelText(/Nom complet/i), "Awa Koffi");
    await user.type(screen.getByLabelText(/Téléphone/i), "+22890123456");
    await user.type(screen.getByLabelText(/Quartier/i), "Adidogomé");
    const quantite = screen.getByLabelText(/Quantité/i);
    await user.clear(quantite);
    await user.type(quantite, "2");

    await user.click(screen.getByRole("button", { name: /Envoyer ma commande/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(body).toMatchObject({
      produit_id: "prod-1",
      client_nom: "Awa Koffi",
      client_telephone: "+22890123456",
      quartier: "Adidogomé",
      quantite: 2,
      prix_total: 2000,
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/confirmation"));
  });
});
