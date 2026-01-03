import { test } from '@playwright/test';

const PROD_URL = 'https://task-tracker-livid-alpha.vercel.app';
const TEST_EMAIL = 'kriger.5490@gmail.com';
const TEST_PASSWORD = 'Kriger.5490';

test('Full app test with console logging', async ({ page }) => {
  // Capture console logs and errors
  const logs: string[] = [];
  const errors: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('❌ Console Error:', text);
    }
  });

  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
    errors.push(error.message);
  });

  page.on('requestfailed', request => {
    console.log('❌ Failed Request:', request.url(), request.failure()?.errorText);
  });

  console.log('\n=== NAVIGATING TO APP ===');
  await page.goto(PROD_URL);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-1-landing.png', fullPage: true });

  console.log('\n=== LOGGING IN ===');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign in")');

  console.log('Waiting 10 seconds for app to load...');
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'test-2-after-login.png', fullPage: true });

  console.log('\n=== CHECKING PAGE STATE ===');
  const url = page.url();
  console.log('Current URL:', url);

  const bodyText = await page.locator('body').textContent();
  console.log('Page has "Personal":', bodyText?.includes('Personal'));
  console.log('Page has "CSuite":', bodyText?.includes('CSuite'));
  console.log('Page has "Health":', bodyText?.includes('Health'));

  // Check for tabs
  const tabCount = await page.locator('[role="tab"]').count();
  console.log('Tab elements found:', tabCount);

  if (tabCount > 0) {
    console.log('\n=== TABS FOUND ===');
    const tabs = page.locator('[role="tab"]');
    for (let i = 0; i < await tabs.count(); i++) {
      const tabText = await tabs.nth(i).textContent();
      console.log(`Tab ${i + 1}:`, tabText);
    }
  } else {
    console.log('\n⚠️  NO TABS FOUND - APP NOT LOADING PROPERLY');
  }

  await page.screenshot({ path: 'test-3-final-state.png', fullPage: true });

  console.log('\n=== SUMMARY ===');
  console.log('Total console logs:', logs.length);
  console.log('Total errors:', errors.length);

  if (errors.length > 0) {
    console.log('\n=== ALL ERRORS ===');
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
});
