import { test, expect } from "@playwright/test";

test.describe("Navbar — desktop", () => {
  // Ce bloc s'exécute sur le projet chromium (desktop) uniquement.
  // Sur mobile le menu hamburger masque les liens desktop.
  test.skip(({ isMobile }) => isMobile, "Test réservé au desktop");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test('le lien "Catégories" navigue vers /categories', async ({ page }) => {
    // Le lien desktop est dans la nav ; on cible par son texte exact.
    await page.getByRole("link", { name: "Catégories" }).first().click();
    await expect(page).toHaveURL("/categories");
  });

  test('le CTA "Commander" navigue vers /categories', async ({ page }) => {
    // Le bouton "Commander" desktop est un lien stylisé btn-primary
    await page.getByRole("link", { name: "Commander" }).first().click();
    await expect(page).toHaveURL("/categories");
  });
});

test.describe("Navbar — mobile (menu hamburger)", () => {
  test.skip(({ isMobile }) => !isMobile, "Test réservé au mobile");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("le bouton menu ouvre le panneau et les liens deviennent visibles", async ({
    page,
  }) => {
    // Le menu est initialement fermé — les liens mobiles ne sont pas dans le DOM
    const mobilePanel = page.locator(".sm\\:hidden").nth(1);

    // Ouvre le menu via le bouton hamburger (aria-label dynamique)
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();

    // Après ouverture, le lien Catégories dans le panneau mobile est visible
    await expect(
      page.getByRole("link", { name: "Catégories" }).last()
    ).toBeVisible();
  });

  test("un clic sur un lien du menu mobile ferme le panneau", async ({
    page,
  }) => {
    // Ouvre le menu
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();

    // Clique sur le lien Catégories dans le panneau mobile
    await page.getByRole("link", { name: "Catégories" }).last().click();

    // Après navigation, on est sur /categories et le bouton redevient "Ouvrir le menu"
    await expect(page).toHaveURL("/categories");
    // Le panneau est fermé car closeMobile() est appelé au onClick
    await expect(
      page.getByRole("button", { name: "Ouvrir le menu" })
    ).toBeVisible();
  });
});
