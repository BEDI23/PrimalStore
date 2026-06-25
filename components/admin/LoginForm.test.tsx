// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";
import { renderWithClient } from "./test-utils";

// ── Fonctions mock hoistées ───────────────────────────────────────────────────
// vi.hoisted garantit que ces valeurs sont disponibles dans les factories
// vi.mock (qui sont elles-mêmes hoistées avant les déclarations du module).
const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
}));

// ── Navigation ────────────────────────────────────────────────────────────────
// push/refresh : référencés dans une closure paresseuse → pas besoin de vi.hoisted.
const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

// ── Couche services ───────────────────────────────────────────────────────────
// authService.login est référencé directement dans l'objet factory → vi.hoisted requis.
vi.mock("@/lib/api/services", () => ({
  authService: {
    login: mockLogin,
    me: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}));

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  mockLogin.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  it("affiche une erreur d'email réactive après blur", async () => {
    const user = userEvent.setup();
    renderWithClient(<LoginForm />);

    // Mode "onTouched" : la validation se déclenche sur le premier blur.
    await user.type(screen.getByLabelText(/Email/i), "pasunemail");
    await user.tab(); // blur sur le champ email

    expect(
      await screen.findByText("Adresse email invalide.")
    ).toBeInTheDocument();
  });

  it("bloque la connexion quand le formulaire est vide", async () => {
    const user = userEvent.setup();
    renderWithClient(<LoginForm />);

    // Submit valide tous les champs même non touchés.
    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    expect(
      await screen.findByText("Le mot de passe est obligatoire.")
    ).toBeInTheDocument();
    // Aucun appel réseau ne doit partir.
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("connecte un admin valide et redirige vers /admin/dashboard", async () => {
    mockLogin.mockResolvedValue({ user: { id: "admin-1" } });
    const user = userEvent.setup();
    renderWithClient(<LoginForm />);

    await user.type(screen.getByLabelText(/Email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/Mot de passe/i), "secret");
    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "secret",
      })
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/dashboard"));
  });
});
