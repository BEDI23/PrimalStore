import { test, expect } from "@playwright/test";

// Chaque test démarre avec un contexte vierge : localStorage propre.
// Playwright crée un nouveau contexte de navigateur par test dans le même fichier
// sauf si on utilise test.use({ storageState: ... }). Ici on efface manuellement.

test.describe("Age Gate — /categories/bien-etre-intime", () => {
  const ADULT_URL = "/categories/bien-etre-intime";

  test.beforeEach(async ({ page }) => {
    // Garantit un localStorage propre avant chaque test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("le modal est visible et les produits sont masqués avant confirmation", async ({
    page,
  }) => {
    await page.goto(ADULT_URL);

    // Le dialog AgeGate est visible
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Avez-vous 18 ans ou plus ?" })
    ).toBeVisible();

    // La grille de produits n'est pas visible tant que l'âge n'est pas confirmé.
    // AgeGate rend les children uniquement si confirmed === true.
    // On vérifie qu'aucun lien "Commander" de ProductCard n'est visible.
    await expect(
      page.getByRole("link", { name: "Commander" }).first()
    ).not.toBeVisible();
  });

  test('clic "Quitter" redirige vers /categories', async ({ page }) => {
    await page.goto(ADULT_URL);

    // Le modal est présent
    await expect(page.getByRole("dialog")).toBeVisible();

    // Clic sur "Quitter"
    await page.getByRole("button", { name: "Quitter" }).click();

    // On est redirigé vers /categories
    await expect(page).toHaveURL("/categories");
  });

  test('clic "J\'ai 18 ans ou plus" ferme le modal et affiche la grille', async ({
    page,
  }) => {
    await page.goto(ADULT_URL);

    // Confirm age
    await page.getByRole("button", { name: "J'ai 18 ans ou plus" }).click();

    // Le modal disparaît
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // La grille de produits devient visible (au moins un lien "Commander")
    await expect(
      page.getByRole("link", { name: "Commander" }).first()
    ).toBeVisible();
  });

  test("après confirmation, un rechargement ne réaffiche pas le modal (localStorage mémorisé)", async ({
    page,
  }) => {
    await page.goto(ADULT_URL);

    // Confirme l'âge
    await page.getByRole("button", { name: "J'ai 18 ans ou plus" }).click();

    // Attend que le modal disparaisse — preuve que la confirmation est prise en compte
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Recharge la page
    await page.reload();

    // Le modal ne doit PAS réapparaître car localStorage contient la clé
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Les produits sont directement accessibles
    await expect(
      page.getByRole("link", { name: "Commander" }).first()
    ).toBeVisible();
  });
});
