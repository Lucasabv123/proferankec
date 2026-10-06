// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the TopBanner with correct title and login form', async ({ page }) => {
    // Check if the header contains the correct title
    const headerTitle = page.locator('header h1');
    await expect(headerTitle).toHaveText('Professor Rank');

    // Check if the login button is present when not logged in
    const loginButton = page.locator('button', { hasText: 'Sign in with Google' }); 
    await expect(loginButton).toBeVisible();
  });

  test('should render user info if logged in', async ({ page }) => {
    // Mock a session where the user is logged in
    await page.context().addCookies([{
      name: 'next-auth.session-token',
      value: 'your-session-token',
      domain: 'localhost',
      path: '/',
    }]);

    // Reload page to reflect session
    await page.reload();

    // Check that the user info is displayed instead of the login button
    const userInfo = page.locator('h1', { hasText: 'Welcome,' });
    await expect(userInfo).toBeVisible();
  });

  test('should render the search bars for professors and courses', async ({ page }) => {
    // Check for the professor search section
    const professorSearchTitle = page.locator('h2', { hasText: 'Professors Search' });
    await expect(professorSearchTitle).toBeVisible();

    const professorSearchBar = page.locator('input[placeholder="Search for professors..."]');
    await expect(professorSearchBar).toBeVisible();

    // Check for the course search section
    const courseSearchTitle = page.locator('h2', { hasText: 'Courses Search' });
    await expect(courseSearchTitle).toBeVisible();

    const courseSearchBar = page.locator('input[placeholder="Search for courses..."]');
    await expect(courseSearchBar).toBeVisible();
  });

  test('should navigate to search results when a search is performed', async ({ page }) => {
    // Type into the professor search bar
    const professorSearchBar = page.locator('input[placeholder="Search for professors..."]');
    await professorSearchBar.fill('Smith');

    // Click the search button
    const searchButton = page.locator('button', { hasText: 'Search Professors' });
    await searchButton.click();

    // Expect to be navigated to the search results page
    await expect(page).toHaveURL(/\/search\/professor\?q=Smith/);
  });
});
