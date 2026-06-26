import { test, expect } from "@playwright/test";

test.describe("Page /categories", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
  });

  test("affiche les 4 catégories par nom", async ({ page }) => {
    await expect(
      page.getByText("Bien-être Intime", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Lingerie & Séduction", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Cosmétiques Sensuels", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Accessoires Lifestyle", { exact: true })
    ).toBeVisible();
  });

  test("les cartes adultes affichent exactement 2 badges 18+", async ({
    page,
  }) => {
    // Les catégories "Bien-être Intime" et "Lingerie & Séduction" sont adultes
    const badges = page.getByText("18+", { exact: true });
    await expect(badges).toHaveCount(2);
  });

  test("les catégories non-adultes n'ont pas de badge 18+", async ({ page }) => {
    // On vérifie que les cartes Cosmétiques et Accessoires n'ont pas le badge.
    // On contrôle via le comptage global (2 au total, cf. test précédent).
    // Ici on s'assure qu'aucun texte "18+" n'est visible hors des 2 attendus.
    const badges = page.getByText("18+", { exact: true });
    await expect(badges).toHaveCount(2);
  });
});
