import { expect, test } from '@playwright/test';
import { TAXONOMY_MODULES, CLI_MAN_PAGES } from '../src/data/taxonomy';
import { CANONICAL_PAPERS } from '../src/data/papers';
import { LEARNING_RESOURCES } from '../src/data/resources';

test('keyboard entry leads to the first lesson and refresh keeps the curriculum open', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'WTF IS AI' })).toBeVisible();
  const enter = page.getByRole('button', { name: 'Enter curriculum' });
  await page.keyboard.press('Tab');
  await expect(enter).toBeFocused();
  await page.keyboard.press('Enter');
  const start = page.getByRole('button', { name: 'Start with Python' });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.getByRole('heading', { name: 'WTF is Python?' })).toBeVisible();
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.getByText('Calculate an average', { exact: true })).toBeVisible();
  await page.reload();
  await expect(start).toBeVisible();
  await expect(enter).toHaveCount(0);
});

test('on a small screen, reduced motion keeps the water still and the entry button usable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const water = page.locator('canvas.entry-water[data-ready]');
  await expect(water).toBeInViewport({ ratio: 1 });
  const pixels = () => water.evaluate(node => (node as HTMLCanvasElement).toDataURL());
  const before = await pixels();
  await water.click();
  await water.evaluate(() => new Promise(resolve => setTimeout(resolve, 150)));
  expect(await pixels()).toBe(before);
  const enter = page.getByRole('button', { name: 'Enter curriculum' });
  await expect(enter).toBeInViewport({ ratio: 1 });
  await enter.click();
  await expect(page.getByRole('button', { name: 'Start with Python' })).toBeVisible();
});

test('every paper and terminal lesson command points to a lesson in its module', () => {
  for (const link of [...CANONICAL_PAPERS, ...Object.values(CLI_MAN_PAGES)]) {
    const module = TAXONOMY_MODULES.find(item => item.id === link.moduleId);
    expect(module?.subTopics.map(topic => topic.id), link.title).toContain(link.subTopicId);
  }
});

test('every lesson has a library and all assigned readings exist in the directory', () => {
  const readings = new Set(LEARNING_RESOURCES.map(resource => resource.id));
  for (const topic of TAXONOMY_MODULES.flatMap(module => module.subTopics)) {
    expect(topic.libraries.length, topic.id).toBeGreaterThan(0);
    for (const library of topic.libraries) {
      expect(new URL(library.url).protocol, library.name).toBe('https:');
      expect(library.purpose.trim(), library.name).not.toBe('');
    }
    for (const id of topic.readingIds ?? []) expect(readings.has(id), id).toBe(true);
  }
});

test('phone lab toolbar stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter curriculum' }).click();
  await page.getByRole('button', { name: /04: (3D_LAB|AI_SYSTEMS_LAB)/ }).click();
  const reset = page.getByRole('button', { name: '[RESET]', exact: true });
  await expect(reset).toBeVisible();
  expect(await reset.evaluate(el => el.getBoundingClientRect().right)).toBeLessThanOrEqual(320);
});

test('breaking one lab preserves the baseline of other scenes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter curriculum' }).click();
  await page.getByRole('button', { name: /04: (3D_LAB|AI_SYSTEMS_LAB)/ }).click();
  await page.getByRole('button', { name: /BREAK_IT_PRESET/ }).click();
  await page.getByRole('button', { name: /03:EMBEDDING_MANIFOLD/ }).click();
  await expect(page.getByText(/INSTABILITY_TRIGGERED|simulated exploding gradients/i)).toHaveCount(0);
  await page.getByRole('button', { name: /01:NEURAL_NET_LAB/ }).click();
  await expect(page.getByText(/simulated exploding gradients/i)).toBeVisible();
  await page.getByRole('button', { name: '[RESET]', exact: true }).click();
  await expect(page.getByText(/simulated exploding gradients/i)).toHaveCount(0);
});
