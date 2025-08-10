import { test, expect } from '@playwright/test';

test.describe('E-Commerce Flow (Happy Path)', () => {

  test('User can navigate, place an order, and see OTP prompt', async ({ page }) => {
    // 1. Start at the home page (defaulting to French)
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle(/Tussna Biocosmétique/);
    await expect(page.getByRole('heading', { name: 'La Nature, Votre Beauté.' })).toBeVisible();

    // 2. Navigate to the products page
    await page.getByRole('link', { name: 'Produits' }).click();
    await expect(page).toHaveURL(/.*\/products/);
    await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible();

    // 3. Click on the first available product
    // We target a product that is not out of stock
    const firstProductCard = page.locator('.grid > div').filter({ hasNotText: 'Stock épuisé' }).first();
    await expect(firstProductCard).toBeVisible();
    await firstProductCard.getByRole('link').first().click();

    // 4. On PDP, click "Acheter maintenant"
    // This is a simplification; a real app would have an "Add to Cart" flow.
    // We are navigating directly to checkout.
    await page.goto('http://localhost:5173/checkout');

    // 5. Fill out the checkout form
    await expect(page.getByRole('heading', { name: 'Commander' })).toBeVisible();
    await page.getByLabel('Nom complet').fill('John Doe');
    await page.getByLabel('Téléphone').fill('0612345678');
    await page.getByLabel('Ville').selectOption('Casablanca');
    await page.getByLabel('Adresse complète').fill('123 Rue de Test, Anfa');
    await page.getByLabel("J'accepte la politique de confidentialité").check();

    // 6. Submit the order
    // Mock the API response to avoid actual order creation in tests
    await page.route('**/api/orders', async route => {
      const json = {
        id: 'clxkhg9s4000008l3c3k52b0g', // dummy CUID
        shortId: 'TEST1234',
        status: 'VERIFYING',
        totals: { subtotal: 189, shipping: 25, codFee: 0, grandTotal: 214 },
        nextAction: { type: 'OTP_VERIFY' }
      };
      await route.fulfill({ json });
    });

    await page.getByRole('button', { name: 'Confirmer la commande' }).click();

    // 7. Land on the order success page and see the OTP prompt
    await expect(page).toHaveURL(/.*\/order-success/);
    await expect(page.getByText('Votre commande #TEST1234 a bien été enregistrée.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Veuillez saisir le code de vérification reçu' })).toBeVisible();
    await expect(page.getByPlaceholder('------')).toBeVisible();
  });

});
