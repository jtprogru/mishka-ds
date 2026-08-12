/* Генерит UnoCSS-пресет для slidev-theme-bear из токенов.

   Пресет намеренно отдаёт `var(--…)`, а не хексы: тогда утилита `bg-elev`
   переключается вместе с темой сама, без дублирования классов под dark.
   Хексы попадают в файл только там, где var() не работает — в подсказках
   для редактора.

   До объединения этот маппинг жил в uno.config.ts темы и повторял имена
   токенов руками: каждый новый токен приходилось прописывать в двух местах,
   и цвет графиков туда просто не доехал. Теперь список выводится из tokens.json.
*/

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens/tokens.json'), 'utf8'));

const v = (name) => `var(--${name})`;

const colors = {
  accent: {
    300: v('accent-300'),
    400: v('accent-400'),
    600: v('accent-600'),
    700: v('accent-700'),
    DEFAULT: v('accent-400'),
  },
  paper: v('bg'),
  elev: v('bg-elev'),
  sunken: v('bg-sunken'),
  ink: v('fg'),
  muted: v('fg-muted'),
  subtle: v('fg-subtle'),
  hair: v('border'),
  'hair-strong': v('border-strong'),
  note: v('c-note'),
  tip: v('c-tip'),
  important: v('c-important'),
  warn: v('c-warn'),
  danger: v('c-danger'),
  chart: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((i) => [i, v(`chart-${i}`)])),
};

const fontSize = Object.fromEntries(
  Object.entries(tokens.fontSize).map(([k, val]) => [k.replace(/^fs-/, ''), val]),
);
const spacing = Object.fromEntries(
  Object.entries(tokens.space).map(([k, val]) => [k.replace(/^gap-/, ''), val]),
);
const borderRadius = Object.fromEntries(
  Object.entries(tokens.radius).map(([k, val]) => [k.replace(/^radius-/, ''), val]),
);

const file = `/* СГЕНЕРИРОВАНО mishka-ds (scripts/gen-unocss-preset.mjs). Руками не править.
   Источник — src/styles/tokens.css. Обновляется вместе с пакетом.

   Подключение в slidev-theme-bear/uno.config.ts:

     import { defineConfig } from 'unocss'
     import { theme, shortcuts } from '@jtprogru/mishka-ds/unocss'
     export default defineConfig({ theme, shortcuts })
*/

export const theme = ${JSON.stringify({ colors, fontSize, spacing, borderRadius }, null, 2)}

export const shortcuts = {
  /* Ссылка с корректным контрастом в обеих темах (BRANDING §8): на светлом
     работает затемнённая ступень, на тёмном — светлая. */
  'text-link': 'text-accent-700 dark:text-accent-300',
  /* Крупный акцентный текст — заголовок раздела, цифра факта. Обычным кеглем
     этой утилитой не набирать: accent-600 проходит только AA large. */
  'text-display-accent': 'text-accent-600',
}

export default { theme, shortcuts }
`;

mkdirSync(resolve(root, 'dist/unocss'), { recursive: true });
writeFileSync(resolve(root, 'dist/unocss/index.js'), file);
console.log(`unocss: dist/unocss/index.js (${Object.keys(colors).length} цветовых групп)`);
