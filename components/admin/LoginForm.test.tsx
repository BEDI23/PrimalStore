// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

const signInWithPassword = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signInWithPassword, signOut: vi.fn() },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => ({ data: { id: "admin-1" } }) }),
      }),
    }),
  }),
}));

beforeEach(() => {
  push.mockReset();
  signInWithPassword.mockReset();
});

describe("LoginForm", () => {
  it("affiche une erreur d'email réactive après blur", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/Email/i), "pasunemail");
    await user.tab();

    expect(
      await screen.findByText("Adresse email invalide.")
    ).toBeInTheDocument();
  });

  it("bloque la connexion quand le formulaire est invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    expect(
      await screen.findByText("Le mot de passe est obligatoire.")
    ).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("connecte un admin valide", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/Email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/Mot de passe/i), "secret");
    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    expect(await screen.findByRole("button", { name: /Se connecter/i }))
      .toBeInTheDocument();
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret",
    });
  });
});
