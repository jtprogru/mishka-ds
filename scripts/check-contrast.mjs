#!/usr/bin/env node
/*
 * Проверка контрастности бренд-токенов ≥ WCAG AA (BRANDING §8).
 *
 * Считает WCAG contrast ratio для каждой текстовой пары «цвет текста / фон»
 * в обеих темах и падает с кодом 1, если хоть одна пара ниже порога. Значения
 * совпадают с WebAIM Contrast Checker до второго знака.
 *
 * Расширение того, что жило в slidev-theme-bear: раньше проверялась только
 * палитра презентаций, теперь — общие токены, то есть разом блог, резюме,
 * слайды и печать. Расхождение по контрасту между поверхностями стало
 * невозможным: цвет один на всех.
 *
 * Зависимостей нет намеренно: формула WCAG детерминирована, а лишний пакет
 * в CI не нужен.
 *
 *   node scripts/check-contrast.mjs
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const AA_NORMAL = 4.5; // обычный текст
const AA_LARGE = 3.0;  // крупный (≥ 24px или ≥ 18.66px bold)

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens/tokens.json'), 'utf8'));

const toRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => Number.parseInt(n.slice(i, i + 2), 16));
};

const relLuminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [l1, l2] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** Пары, обязательные для обеих тем. */
const commonPairs = [
  ['fg', 'bg', 'основной текст / фон страницы', AA_NORMAL],
  ['fg', 'bg-elev', 'основной текст / карточка', AA_NORMAL],
  ['fg-muted', 'bg', 'мета и подписи / фон', AA_NORMAL],
  ['fg-muted', 'bg-elev', 'мета и подписи / карточка', AA_NORMAL],
  ['fg-subtle', 'bg', 'тихие подписи / фон', AA_NORMAL],
  ['code-fg', 'code-bg', 'код / подложка кода', AA_NORMAL],
  ['c-note-text', 'bg-elev', 'заголовок callout note', AA_NORMAL],
  ['c-tip-text', 'bg-elev', 'заголовок callout tip', AA_NORMAL],
  ['c-important-text', 'bg-elev', 'заголовок callout important', AA_NORMAL],
  ['c-warn-text', 'bg-elev', 'заголовок callout warn', AA_NORMAL],
  ['c-danger-text', 'bg-elev', 'заголовок callout danger', AA_NORMAL],
  ['accent', 'bg', 'ссылка / фон страницы', AA_NORMAL],
  ['accent', 'bg-elev', 'ссылка / карточка', AA_NORMAL],
  ['accent-hover', 'bg', 'ссылка при наведении / фон', AA_NORMAL],

  /* Подсветка синтаксиса. Роли catppuccin читаются на подложке кода, и это
     проверяется машиной, а не глазами: код читают дольше и внимательнее
     любого другого текста, а роли легко уплывают при правке палитры. */
  ['syn-keyword', 'code-bg', 'синтаксис: ключевое слово', AA_NORMAL],
  ['syn-string', 'code-bg', 'синтаксис: строка', AA_NORMAL],
  ['syn-number', 'code-bg', 'синтаксис: число', AA_NORMAL],
  ['syn-constant', 'code-bg', 'синтаксис: константа', AA_NORMAL],
  ['syn-comment', 'code-bg', 'синтаксис: комментарий', AA_NORMAL],
  ['syn-function', 'code-bg', 'синтаксис: функция', AA_NORMAL],
  ['syn-type', 'code-bg', 'синтаксис: тип', AA_NORMAL],
  ['syn-variable', 'code-bg', 'синтаксис: переменная', AA_NORMAL],
  ['syn-operator', 'code-bg', 'синтаксис: оператор', AA_NORMAL],
  ['syn-meta', 'code-bg', 'синтаксис: мета', AA_NORMAL],
];

/* accent-600 проверяется по порогу для крупного текста: BRANDING §2 разрешает
   его только на крупном кегле. Проверяем и на фоне страницы, и на карточке —
   именно вторая пара строже и именно её обычно забывают. */
const largePairs = [
  ['accent-600', 'bg', 'акцент на крупном тексте / фон', AA_LARGE],
  ['accent-600', 'bg-elev', 'акцент на крупном тексте / карточка', AA_LARGE],
];
const lightPairs = largePairs;
const darkPairs = largePairs;

const themes = [
  { name: 'light · catppuccin Latte', vars: tokens.color.light, pairs: [...commonPairs, ...lightPairs] },
  { name: 'dark · catppuccin Macchiato', vars: tokens.color.dark, pairs: [...commonPairs, ...darkPairs] },
];

let failed = 0;

for (const theme of themes) {
  console.log(`\n=== ${theme.name} ===`);
  for (const [fgTok, bgTok, label, threshold] of theme.pairs) {
    const fg = theme.vars[fgTok];
    const bg = theme.vars[bgTok];
    if (!/^#[0-9a-f]{3,8}$/i.test(fg ?? '') || !/^#[0-9a-f]{3,8}$/i.test(bg ?? '')) {
      console.log(`  ⚠ ${label}: не резолвится (--${fgTok}=${fg}, --${bgTok}=${bg})`);
      failed++;
      continue;
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= threshold;
    if (!ok) failed++;
    const level = threshold === AA_LARGE ? 'AA large' : 'AA';
    console.log(
      `  ${ok ? '✓' : '✗'} ${label.padEnd(34)} ${fg} на ${bg}  ${ratio.toFixed(2)}:1  ${level}`
      + `${ok ? '' : `  ниже ${threshold}`}`,
    );
  }
}

/* Категориальная палитра: меряем яркостное разделение соседних серий. Это не
   про WCAG — цветовые заливки под него не подпадают, — а про ч/б печать и
   дешёвый проектор, где от оттенка остаётся одна яркость.
   Тона catppuccin лежат в узкой полосе яркости, особенно в тёмной теме, и
   развести восемь серий по яркости внутри палитры физически нельзя. Отсюда
   правило системы: цвет в графике всегда дублируется вторым различителем —
   подписью у линии, формой маркера или штриховкой. Падаем только если две
   соседние серии практически совпали (< 1.15) — это уже опечатка в токенах. */
/* 1.15:1 — доказанный потолок для восьми акцентов catppuccin (перебор всех
   перестановок, см. комментарий в tokens.css). Порог чуть ниже: он ловит
   регрессию порядка, а не требует невозможного. */
const SERIES_MIN = 1.14;
console.log('\n=== категориальная палитра (яркостное разделение соседей) ===');
for (const theme of ['light', 'dark']) {
  const vars = tokens.color[theme];
  const series = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => vars[`chart-${i}`]).filter(Boolean);
  let min = Number.POSITIVE_INFINITY;
  const collisions = [];
  for (let i = 1; i < series.length; i++) {
    const ratio = contrast(series[i - 1], series[i]);
    min = Math.min(min, ratio);
    if (ratio < SERIES_MIN) collisions.push(`${i}↔${i + 1} (${ratio.toFixed(2)}:1)`);
  }
  if (collisions.length) failed++;
  console.log(
    `  ${collisions.length ? '✗' : '✓'} ${theme}: минимум ${min.toFixed(2)}:1`
    + `${collisions.length ? ` — слились ${collisions.join(', ')}` : ' — второй различитель обязателен'}`,
  );
}

if (failed) {
  console.error(`\n✗ ${failed} пар(а) ниже порога. Правь src/styles/tokens.css.`);
  process.exit(1);
}
console.log('\n✓ Все текстовые пары проходят порог WCAG.');
