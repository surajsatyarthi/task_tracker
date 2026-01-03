import { test, expect } from '@playwright/test';

const PROD_URL = 'https://task-tracker-livid-alpha.vercel.app';
const TEST_EMAIL = 'kriger.5490@gmail.com';
const TEST_PASSWORD = 'Kriger.5490';

test.beforeEach(async ({ page }) => {
  await page.goto(PROD_URL);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(8000); // Wait for app to fully load
});

test('BUG #1 VERIFIED: Task counts are correct and only shown for task ledgers', async ({ page }) => {
  await page.screenshot({ path: 'verify-1-task-counts.png', fullPage: true });

  // Get all project tabs
  const csuiteTab = page.locator('text=/^CSuite/');
  const personalTab = page.locator('text=/^Personal/');
  const healthTab = page.locator('text=/^Health$/');
  const journalingTab = page.locator('text=/^Journaling$/');

  // CSuite should show 0
  const csuiteText = await csuiteTab.textContent();
  console.log('✓ CSuite tab text:', csuiteText);
  expect(csuiteText).toContain('0');

  // Personal should show a number (26 or 27)
  const personalText = await personalTab.textContent();
  console.log('✓ Personal tab text:', personalText);
  expect(personalText).toMatch(/2[67]/); // Should be 26 or 27

  // Health should NOT have a number badge
  const healthText = await healthTab.textContent();
  console.log('✓ Health tab text:', healthText);
  expect(healthText).toBe('Health'); // Just the word, no number

  // Journaling should NOT have a number badge
  const journalingText = await journalingTab.textContent();
  console.log('✓ Journaling tab text:', journalingText);
  expect(journalingText).toBe('Journaling'); // Just the word, no number

  console.log('✅ BUG #1 FIX VERIFIED: Task counts are correct and only shown for Personal/CSuite');
});

test('BUG #2 PREP: Check that counts update after CRUD (create test)', async ({ page }) => {
  // Click Personal tab
  await page.click('text=/^Personal/');
  await page.waitForTimeout(2000);

  // Get initial count
  const personalTab = page.locator('text=/^Personal/');
  const initialText = await personalTab.textContent();
  const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
  console.log('Initial Personal count:', initialCount);

  await page.screenshot({ path: 'verify-2a-before-create.png', fullPage: true });

  // Create a new task
  await page.click('button:has-text("Add Task")');
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder*="title"]', 'PLAYWRIGHT TEST TASK - DELETE ME');
  await page.click('button:has-text("Create Task")');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'verify-2b-after-create.png', fullPage: true });

  // Check if count increased
  const updatedText = await personalTab.textContent();
  const updatedCount = parseInt(updatedText?.match(/\d+/)?.[0] || '0');
  console.log('Updated Personal count:', updatedCount);

  expect(updatedCount).toBe(initialCount + 1);
  console.log('✅ BUG #2 FIX VERIFIED: Count updated after creating task');

  // Clean up - delete the test task
  const testTask = page.locator('text=PLAYWRIGHT TEST TASK - DELETE ME').first();
  if (await testTask.isVisible({ timeout: 2000 }).catch(() => false)) {
    await testTask.click();
    await page.waitForTimeout(1000);

    // Look for delete button in modal
    const deleteButton = page.locator('button:has-text("Delete")');
    if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(2000);
    }
  }
});

test('APP HEALTH: All views render without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page error:', error.message);
  });

  // Test Matrix view (default)
  await page.screenshot({ path: 'verify-3a-matrix-view.png', fullPage: true });
  await expect(page.locator('text=Do First')).toBeVisible();
  console.log('✓ Matrix view renders');

  // Test List view
  await page.click('button:has-text("Table")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verify-3b-list-view.png', fullPage: true });
  console.log('✓ List view renders');

  // Test Calendar view
  await page.click('button:has-text("Calendar")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verify-3c-calendar-view.png', fullPage: true });
  console.log('✓ Calendar view renders');

  expect(errors.length).toBe(0);
  console.log('✅ All views render without errors');
});

test('MOBILE: Responsive design check', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(PROD_URL);

  // Login again with mobile viewport
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'verify-4-mobile.png', fullPage: true });

  // Check tabs are visible
  const personalTab = page.locator('text=/^Personal/');
  await expect(personalTab).toBeVisible();

  console.log('✅ Mobile responsive design verified');
});
