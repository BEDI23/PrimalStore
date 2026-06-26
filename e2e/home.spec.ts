import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("répond et affiche le h1 du hero", async ({ page }) => {
    await expect(page).toHaveURL("/");
    // Le h1 contient le texte principal du hero
    await expect(
      page.getByRole("heading", { level: 1, name: /Tout ce qu'il vous faut/i })
    ).toBeVisible();
  });

  test("affiche la section Nos catégories avec au moins 1 carte", async ({
    page,
  }) => {
    // Le h2 de la section catégories
    await expect(
      page.getByRole("heading", { level: 2, name: "Nos catégories" })
    ).toBeVisible();

    // Au moins 1 lien vers une URL /categories/...
    const categoryLinks = page.getByRole("link").filter({
      has: page.locator('[href^="/categories/"]'),
    });
    await expect(categoryLinks.first()).toBeVisible();
  });

  test('le lien "Voir toutes les catégories" navigue vers /categories', async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: "Voir toutes les catégories" })
      .click();
    await expect(page).toHaveURL("/categories");
  });
});
