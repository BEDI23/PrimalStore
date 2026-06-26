import { test, expect } from "@playwright/test";

test.describe("Catégorie non-adulte : /categories/cosmetiques-sensuels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories/cosmetiques-sensuels");
  });

  test("aucun modal d'âge — le texte de vérification d'âge n'est pas présent", async ({
    page,
  }) => {
    // On attend que la page soit chargée (le titre h1 de la catégorie est visible)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Le texte du modal AgeGate ne doit PAS apparaître
    await expect(
      page.getByText("Avez-vous 18 ans ou plus ?")
    ).not.toBeVisible();
  });

  test("la grille de produits est visible avec au moins 1 carte ayant un bouton Commander", async ({
    page,
  }) => {
    // Au moins un lien "Commander" provenant d'une ProductCard
    const commanderLinks = page.getByRole("link", { name: "Commander" });
    await expect(commanderLinks.first()).toBeVisible();
  });

  test('les chips de filtre incluent "Tout"', async ({ page }) => {
    // Le composant FilterChips rend un lien avec le texte "Tout"
    await expect(
      page.getByRole("listitem").filter({ hasText: "Tout" }).first()
    ).toBeVisible();
  });

  test("cliquer sur une chip de sous-catégorie change l'URL avec ?sous_categorie=", async ({
    page,
  }) => {
    // On attend que les chips soient présentes
    const chips = page.getByRole("listitem");
    await expect(chips.first()).toBeVisible();

    const allChips = await chips.all();
    // Il faut au moins 2 chips (Tout + au moins une sous-catégorie)
    // Si la catégorie n'a qu'un chip "Tout", le test est ignoré gracieusement
    if (allChips.length < 2) {
      test.skip();
      return;
    }

    // Clique sur la 2e chip (première sous-catégorie)
    await allChips[1].click();

    // L'URL doit contenir ?sous_categorie=
    await expect(page).toHaveURL(/\?sous_categorie=/);

    // La grille doit rester cohérente (pas de page d'erreur)
    // On vérifie l'absence de message d'erreur critique
    await expect(page.getByText("Une erreur est survenue")).not.toBeVisible();
  });
});
