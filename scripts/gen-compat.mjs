/* Генерит src/styles/compat.css — старые имена токенов трёх проектов.

   Почему генерится, а не пишется руками. Кастомное свойство подставляет var()
   в момент объявления, а не в момент использования: если написать
   `--text: var(--fg)` один раз на :root, то во вложенном блоке с другой темой
   `--text` останется со значением, вычисленным на :root. То есть светлым.

   Именно это и сломало витрину: страница была тёмной, а врезки внутри неё —
   светлыми, потому что components.css читает старое имя --bg-elevated.
   Лечится одним способом: алиасы объявляются заново в КАЖДОМ месте, где
   переключается тема. Руками это шесть одинаковых блоков, которые разъедутся
   на первой же правке, поэтому — генератор.

   Когда все три проекта переедут на канонические имена, файл и генератор
   удаляются вместе. */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Старое имя → каноническое. Цветные алиасы повторяются в каждой теме. */
const themed = {
  // hugo-mishka (блог jtprog.ru)
  'bg-elevated': 'bg-elev',
  text: 'fg',
  'text-muted': 'fg-muted',
  'text-subtle': 'fg-subtle',
  'code-text': 'code-fg',
  info: 'c-note',
  success: 'c-tip',
  warning: 'c-warn',
  danger: 'c-danger',

  // savinmi.ru (резюме, Astro)
  rule: 'border',
  link: 'accent',
  'link-hover': 'accent-hover',
  primary: 'accent',
  'callout-note': 'c-note',
  'callout-tip': 'c-tip',
  'callout-important': 'c-important',
  'callout-warn': 'c-warn',
  'callout-danger': 'c-danger',
  'header-bg': 'bg',

  // slidev-theme-bear (презентации)
  'slidev-theme-primary': 'accent-400',
  'slidev-code-background': 'bg-elev',
};

/** Не зависят от темы — достаточно одного объявления на :root. */
const static_ = {
  'font-text': 'font-sans',
  'font-code': 'font-mono',
};

/* Тёмный подвал на светлой странице — приём резюме, а не общий токен.
   На тёмной теме он сливается с фоном, иначе выглядит вырезанной дырой. */
const perScheme = {
  light: { 'footer-bg': '#1e2030', 'footer-fg': '#cad3f5' },
  dark: { 'footer-bg': 'var(--bg-sunken)', 'footer-fg': 'var(--fg)' },
};

/* Каждое место, где включается тема. Порядок совпадает с themes-scoped.css. */
const selectors = [
  [':root,\n:root[data-theme="light"]', 'light'],
  [':root[data-theme="dark"]', 'dark'],
  ['[data-theme="light"]:not(:root)', 'light'],
  ['[data-theme="dark"]:not(:root)', 'dark'],
  ['html.light, .theme-light', 'light'],
  ['html.dark, .theme-dark', 'dark'],
];

const block = (selector, scheme) => {
  const lines = [
    ...Object.entries(themed).map(([alias, canon]) => `  --${alias}: var(--${canon});`),
    ...Object.entries(perScheme[scheme]).map(([alias, value]) => `  --${alias}: ${value};`),
  ];
  return `${selector} {\n${lines.join('\n')}\n}`;
};

const out = [
  '/* СГЕНЕРИРОВАНО scripts/gen-compat.mjs. Руками не править.',
  '',
  '   Старые имена токенов hugo-mishka, savinmi.ru и slidev-theme-bear. Файл',
  '   ничего не объявляет сам — только ссылается на канонические имена из',
  '   tokens.css, поэтому проект может переехать на новые имена когда ему',
  '   удобно, а не в день изменения токенов.',
  '',
  '   Блок повторён для каждого селектора темы намеренно: var() подставляется',
  '   в момент объявления, и алиас, объявленный только на :root, застрял бы в',
  '   светлых значениях внутри тёмного поддерева. */',
  '',
  ...selectors.map(([sel, scheme]) => block(sel, scheme) + '\n'),
  ':root {',
  ...Object.entries(static_).map(([alias, canon]) => `  --${alias}: var(--${canon});`),
  '}',
  '',
].join('\n');

writeFileSync(resolve(root, 'src/styles/compat.css'), out);
console.log(`compat.css: ${Object.keys(themed).length} алиасов × ${selectors.length} селекторов`);
