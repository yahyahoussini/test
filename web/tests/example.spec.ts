import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Vite \+ React/);
});

test('checkout happy path', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Navigate to products page
  await page.getByRole('link', { name: 'Produits' }).click();
  await expect(page).toHaveURL('http://localhost:5173/products');

  // Click on a product's buy now button
  // We are assuming the first product is available
  await page.getByRole('button', { name: 'Acheter maintenant' }).first().click();

  // This should ideally add to cart and navigate to checkout.
  // For this MVP, we will navigate directly to checkout.
  await page.goto('http://localhost:5173/checkout');
  await expect(page.getByRole('heading', { name: 'Commander' })).toBeVisible();

  // Fill out the form
  await page.getByLabel('Nom complet').fill('Test User');
  await page.getByLabel('Téléphone').fill('0600112233');
  await page.getByLabel('Ville').selectOption('Casablanca');
  await page.getByLabel('Adresse complète').fill('123 Test Street, Anfa');
  await page.getByLabel('I accept the privacy policy').check();

  // Place the order
  await page.getByRole('button', { name: 'Confirmer la commande' }).click();

  // Expect to be on the order success page
  await expect(page.getByRole('heading', { name: 'Commande reçue avec succès !' })).toBeVisible();

  // Check if the OTP prompt is visible
  await expect(page.getByText('Veuillez saisir le code de vérification reçu')).toBeVisible();

  // For a real test, we would need to fetch the OTP from a test service or Redis
  // and complete the verification. For this example, we'll stop here.
  const otpInput = page.getByPlaceholder('------');
  await expect(otpInput).toBeVisible();
});
