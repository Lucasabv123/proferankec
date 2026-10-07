// @ts-check
const { test, expect } = require('@playwright/test');

test.use({ locale: 'en-US' });

test.beforeEach(async ({ page }) => {
  // Deterministic UI fixtures: these checks do not need a production database.
  await page.route('**/api/search/**', route => route.fulfill({ json: [] }));
});

test('homepage retains its three searches and sign-in control', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your next semester starts here.');
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  for (const name of ['Search Professors', 'Search Courses', 'Search Schools']) {
    await expect(page.getByRole('combobox', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  }
});

for (const width of [320, 390, 768, 1440]) {
  test(`homepage and results fit a ${width}px screen in Spanish`, async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es-EC', viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.route('**/api/search/**', route => route.fulfill({ json: [] }));
    for (const path of ['/', '/search/professor?q=Ana', '/search/course?q=Arte', '/search/school?q=USFQ']) {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(page.getByRole('combobox')).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
    await context.close();
  });
}

test('search submits by keyboard and by button', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Search Professors', exact: true }).fill('Ana Pérez');
  await page.getByRole('combobox', { name: 'Search Professors', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/search\/professor\?q=Ana%20P%C3%A9rez/);
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Search Courses', exact: true }).fill('ART 1101');
  await page.getByRole('button', { name: 'Search Courses', exact: true }).click();
  await expect(page).toHaveURL(/\/search\/course\?q=ART%201101/);
});

test('suggestions support keyboard selection and escape', async ({ page }) => {
  await page.route('**/api/search/suggest?**', route => route.fulfill({ json: [
    { label: 'Ana Pérez', detail: 'Example university', href: '/search/professor?q=Ana' },
  ] }));
  await page.goto('/');
  const input = page.getByRole('combobox', { name: 'Search Professors', exact: true });
  await input.fill('Ana');
  await expect(page.getByRole('option', { name: /Ana Pérez/ })).toBeVisible();
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.blur();
  await input.focus();
  await input.press('ArrowDown');
  await expect(page.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/search\/professor\?q=Ana/);
});

test('result cards can be opened with the keyboard', async ({ page }) => {
  await page.route('**/api/search/professor?**', route => route.fulfill({ json: [
    { id: 1, Firstname: 'Ana', Lastname: 'Pérez', Prefix: 'Dr.' },
  ] }));
  await page.goto('/search/professor?q=Ana');
  const card = page.getByRole('link', { name: /Ana Pérez/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', /\/professors\/1/);
  await card.focus();
  await expect(card).toBeFocused();
  expect(await card.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});
