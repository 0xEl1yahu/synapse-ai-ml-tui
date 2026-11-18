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
  await expect(page.getByRole('heading', { name: 'WTF is Python?' })).toBeVisible();
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

test('memory estimates disclose assumptions and distinguish modeled outcomes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter curriculum' }).click();
  await page.getByText('Explore interactive tools', { exact: false }).click();
  await expect(page.getByText(/Within estimated budget: 18.1 GB/)).toBeVisible();
  await page.getByRole('button', { name: /70B Dense/ }).click();
  await page.getByRole('button', { name: '24G', exact: true }).click();
  await expect(page.getByText(/Above estimated budget: 145.4 GB/)).toBeVisible();
  await page.getByRole('button', { name: 'INT4_AWQ' }).click();
  await page.getByRole('button', { name: '4x', exact: true }).click();
  await expect(page.getByText(/Within estimated budget: 11.0 GB/)).toBeVisible();
  await page.getByRole('button', { name: 'FULL_ADAMW' }).click();
  await expect(page.getByText(/Above estimated budget: 285.4 GB/)).toBeVisible();
  await expect(page.getByText(/KV cache replicated per GPU/)).toBeVisible();
});

test('lab selectors expose names and update the probe by keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter curriculum' }).click();
  await page.getByRole('button', { name: /04: (3D_LAB|AI_SYSTEMS_LAB)/ }).click();
  const rate = page.getByRole('slider', { name: 'Learning rate' });
  await expect(rate).toHaveValue('0.036');
  await rate.press('ArrowRight');
  await expect(rate).toHaveValue('0.038');
  const neuron = page.getByRole('combobox', { name: 'Inspect neuron' });
  await neuron.selectOption('L1-N2');
  await expect(page.getByText('NODE::L1-N2', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /04:TRANSFORMER_ATTN/ }).click();
  await page.getByRole('combobox', { name: 'Query token' }).selectOption('2');
  await expect(page.getByRole('status').filter({ hasText: 'Query test' })).toBeVisible();
});

test('beginner practice distinguishes review from a passed check', async ({ page }) => {
  await page.goto('/#lesson/wtf-is-python');
  await page.getByRole('button', { name: /MARK_REVIEWED/ }).click();
  await expect(page.getByRole('button', { name: /REVIEWED/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Practice.*Mastered/ })).toHaveCount(0);
  await page.getByRole('spinbutton', { name: 'Last delivery time' }).fill('60');
  const answer = page.getByRole('spinbutton', { name: 'Predicted output' });
  await answer.fill('20');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/Try again/)).toBeVisible();
  await answer.fill('30');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('heading', { name: /Practice.*Mastered/ })).toBeVisible();
  for (const title of [/WTF is a Python list/, /WTF is a Python function/, /WTF is a Python loop/, /WTF is prediction error/, /WTF is a Matrix/]) {
    await page.getByRole('button', { name: /NEXT_CONCEPT/ }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }
});

test('paper and lab locations can be shared and traversed in browser history', async ({ page }) => {
  const paper = CANONICAL_PAPERS.find(item => item.shortSlug === 'flashattention')!;
  await page.goto('/#lesson/wtf-is-python');
  await page.getByRole('button', { name: /03:.*PAPERS/ }).click();
  await page.getByRole('button', { name: /MOUNT.*FlashAttention: Fast/ }).click();
  await expect(page).toHaveURL(new RegExp('#paper/' + paper.id + '$'));
  await page.getByRole('button', { name: /LAUNCH_COUPLED_3D_LAB/ }).click();
  await expect(page).toHaveURL(new RegExp('#lab/' + paper.coupledSceneId + '$'));
  await page.goBack();
  await expect(page.getByRole('button', { name: /MOUNTED.*FlashAttention: Fast/ })).toBeVisible();
  await page.goForward();
  await page.reload();
  await expect(page.getByText(new RegExp('ACTIVE_SCENE: ' + paper.coupledSceneId, 'i'))).toBeVisible();
  const fresh = await page.context().newPage();
  await fresh.goto('/#paper/' + paper.id);
  await expect(fresh.getByRole('button', { name: /MOUNTED.*FlashAttention: Fast/ })).toBeVisible();
});

test('phone paper actions and resource filters remain reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/#paper/' + CANONICAL_PAPERS[0].id);
  const labAction = page.getByRole('button', { name: /LAUNCH_COUPLED_3D_LAB/ });
  await expect(labAction).toBeVisible();
  expect(await labAction.evaluate(el => el.getBoundingClientRect().right)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: /06:.*RESOURCES/ }).click();
  const query = page.getByPlaceholder(/Filter by title/);
  await query.fill('Karpathy');
  const more = page.getByRole('button', { name: 'More filters' });
  await more.click();
  await page.getByRole('button', { name: 'BEGINNER', exact: true }).click();
  await more.click();
  await expect(query).toHaveValue('Karpathy');
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /results/ })).toBeVisible();
});
