import { test, expect } from "@playwright/test";

test.describe("Page commande /commander/[id]", () => {
  test("cliquer Commander depuis la liste cosmetiques-sensuels mène à /commander/<id>", async ({
    page,
  }) => {
    await page.goto("/categories/cosmetiques-sensuels");

    // Attend qu'au moins une carte produit soit visible
    const firstCommanderLink = page
      .getByRole("link", { name: "Commander" })
      .first();
    await expect(firstCommanderLink).toBeVisible();

    // Récupère l'URL cible avant de cliquer (pour vérifier le pattern /commander/<id>)
    const href = await firstCommanderLink.getAttribute("href");
    expect(href).toMatch(/^\/commander\/\d+$/);

    await firstCommanderLink.click();

    // L'URL correspond à /commander/<id>
    await expect(page).toHaveURL(/\/commander\/\d+/);
  });

  test("le formulaire est visible avec les champs obligatoires", async ({
    page,
  }) => {
    await page.goto("/categories/cosmetiques-sensuels");

    const firstCommanderLink = page
      .getByRole("link", { name: "Commander" })
      .first();
    await firstCommanderLink.click();
    await expect(page).toHaveURL(/\/commander\/\d+/);

    // Champs obligatoires identifiés par leur label
    await expect(page.getByLabel(/Nom complet/i)).toBeVisible();
    await expect(page.getByLabel(/Téléphone/i)).toBeVisible();
    await expect(page.getByLabel(/Quartier/i)).toBeVisible();
  });

  test("soumettre le formulaire vide affiche des erreurs de validation sans naviguer vers /confirmation", async ({
    page,
  }) => {
    await page.goto("/categories/cosmetiques-sensuels");

    const firstCommanderLink = page
      .getByRole("link", { name: "Commander" })
      .first();
    await firstCommanderLink.click();
    await expect(page).toHaveURL(/\/commander\/\d+/);

    // Soumet le formulaire sans rien remplir
    // NOTE INTENTIONNELLE : on ne soumet PAS une commande valide pour ne pas créer
    // de vraie commande en base de données. On teste uniquement la validation côté client.
    await page.getByRole("button", { name: "Envoyer ma commande" }).click();

    // Des messages d'erreur de validation apparaissent (react-hook-form + valibot)
    // Le formulaire affiche au moins une erreur (nom, téléphone ou quartier)
    const errorMessages = page.locator(".text-red-600");
    await expect(errorMessages.first()).toBeVisible();

    // On n'a PAS navigué vers /confirmation
    await expect(page).not.toHaveURL("/confirmation");
  });
});
