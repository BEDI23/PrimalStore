// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesManager from "./CategoriesManager";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));

const insert = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert,
      delete: () => ({ eq: () => ({ error: null }) }),
    }),
  }),
}));

beforeEach(() => {
  insert.mockReset();
  insert.mockResolvedValue({ error: null });
  refresh.mockReset();
});

describe("CategoriesManager", () => {
  it("refuse la création avec un nom vide (validation réactive)", async () => {
    const user = userEvent.setup();
    render(<CategoriesManager categories={[]} />);

    await user.click(screen.getByRole("button", { name: /Créer la catégorie/i }));

    expect(
      await screen.findByText("Le nom est obligatoire.")
    ).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();
  });

  it("crée la catégorie quand le nom est valide", async () => {
    const user = userEvent.setup();
    render(<CategoriesManager categories={[]} />);

    await user.type(screen.getByLabelText(/Nom/i), "Cosmétiques");
    await user.click(screen.getByRole("button", { name: /Créer la catégorie/i }));

    await waitFor(() =>
      expect(insert).toHaveBeenCalledWith({ nom: "Cosmétiques" })
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
