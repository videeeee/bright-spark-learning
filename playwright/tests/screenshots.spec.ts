import { test } from '@playwright/test';
import fs from 'fs';

const outDir = 'pr-screenshots';

test.beforeAll(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
});

test('capture home screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${outDir}/home.png`, fullPage: true });
});

test('capture leaderboard screenshot', async ({ page }) => {
  await page.goto('/leaderboard');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${outDir}/leaderboard.png`, fullPage: true });
});

test('capture settings screenshot', async ({ page }) => {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${outDir}/settings.png`, fullPage: true });
});