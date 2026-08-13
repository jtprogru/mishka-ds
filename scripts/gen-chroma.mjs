#!/usr/bin/env node
/*
 * Подсветка кода для Chroma — генератор раскладки классов на токены --syn-*.
 *
 * Hugo красит код Chroma'ой, а не highlight.js, поэтому code.css ему не
 * подходит: там свои имена классов. Раньше блог держал вывод
 * `hugo gen chromastyles --style=catppuccin-{latte,macchiato}` — два профиля с
 * вшитыми хексами, 14 КБ, мимо системы. Сырой catppuccin-latte вдобавок не
 * держит AA на подложке кода: ровно поэтому в tokens.css лежат затемнённые
 * --syn-*, и они проверяются на сборке.
 *
 * Здесь только раскладка ролей: цвет приходит переменной. Отсюда же следствие,
 * которого не было у старого файла, — профиль ровно один. Тему переключают
 * сами токены, дублировать таблицу под light и dark незачем.
 *
 * Ролей меньше, чем классов, и это намеренно: восемь различимых цветов на
 * подложке кода — предел, дальше подсветка мешает читать. Близкие по смыслу
 * классы делят токен.
 *
 *   node scripts/gen-chroma.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* Классы Chroma → роль в системе. Имена ролей — как в tokens.css. */
const ROLES = {
  keyword: {
    classes: ['k', 'kd', 'kn', 'kp', 'kr', 'nt', 'sa'],
    note: 'ключевые слова, теги разметки, префиксы строк',
  },
  type: {
    classes: ['kt', 'nc', 'ne', 'nn'],
    note: 'типы, классы, пространства имён, исключения',
  },
  function: {
    classes: ['nf', 'fm', 'nb', 'bp'],
    note: 'функции и встроенные имена',
  },
  variable: {
    classes: ['nv', 'vc', 'vg', 'vi', 'vm', 'nx', 'x', 'ld', 'cl', 'gl', 'go'],
    note: 'переменные и всё, что печатается цветом текста',
  },
  constant: {
    classes: ['kc', 'no', 'se'],
    note: 'константы и escape-последовательности',
  },
  string: {
    classes: ['s', 's1', 's2', 'sb', 'sc', 'si', 'ss', 'sx', 'dl'],
    note: 'строки во всех видах',
  },
  number: {
    classes: ['m', 'mb', 'mf', 'mh', 'mi', 'mo', 'il'],
    note: 'числа',
  },
  comment: {
    classes: ['c', 'c1', 'ch', 'cm', 'cp', 'cpf', 'cs', 'sd', 'sh', 'gp', 'ln', 'lnt'],
    note: 'комментарии, docstring, приглашение оболочки, номера строк',
  },
  operator: {
    classes: ['o', 'ow', 'or'],
    note: 'операторы',
  },
  meta: {
    classes: ['na', 'nd', 'ni', 'nl', 'py', 'sr'],
    note: 'атрибуты, декораторы, свойства, регулярные выражения',
  },
};

/* Комментарии и приглашение оболочки набираются курсивом: Iosevka italic
   режется специально ради них. */
const ITALIC = ['c', 'c1', 'ch', 'cm', 'cs', 'sd', 'ge'];
const BOLD = ['nd', 'o', 'ow', 'gh', 'gu', 'gs'];

const sel = (cls) => cls.map((c) => `.chroma .${c}`).join(',\n');

const out = [];
out.push(`/* СГЕНЕРИРОВАНО scripts/gen-chroma.mjs. Руками не править.

   Подсветка кода Chroma (Hugo) на токенах --syn-*. Профиль один: тему
   переключают сами токены, поэтому светлой и тёмной таблицы больше нет.

   Порог AA на подложке кода держится в tokens.css и проверяется
   scripts/check-contrast.mjs — здесь только раскладка ролей. */
`);

out.push(`/* Блок кода целиком. */
.chroma {
  color: var(--code-fg);
  background: var(--code-bg);
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
}

.bg { color: var(--code-fg); background: var(--code-bg); }
`);

for (const [role, { classes, note }] of Object.entries(ROLES)) {
  out.push(`/* ${note} */\n${sel(classes)} {\n  color: var(--syn-${role});\n}\n`);
}

out.push(`/* Начертание — второй различитель к цвету. */
${sel(ITALIC)} { font-style: italic; }

${sel(BOLD)} { font-weight: 700; }
`);

out.push(`/* Ошибка разбора и диффы: тут цвет несёт смысл, поэтому берётся не из
   палитры подсветки, а из семантики системы. Значения --c-*-text проверены на
   подложке кода: она совпадает с фоном карточки. */
.chroma .err,
.chroma .gr,
.chroma .gt { color: var(--c-danger-text); }

.chroma .gd { color: var(--c-danger-text); }
.chroma .gi { color: var(--c-tip-text); }
.chroma .gh,
.chroma .gu { color: var(--syn-keyword); }
`);

out.push(`/* Подсветка строки и каркас таблицы с номерами — без цвета текста. */
.chroma .hl { background: var(--border-strong); }

.chroma .ln,
.chroma .lnt {
  white-space: pre;
  -webkit-user-select: none;
  user-select: none;
  margin-right: 0.4em;
  padding: 0 0.4em;
}

.chroma .lnlinks { outline: none; text-decoration: none; color: inherit; }
.chroma .lntd { vertical-align: top; padding: 0; margin: 0; border: 0; }
.chroma .lntable { border-spacing: 0; padding: 0; margin: 0; border: 0; }
.chroma .line { display: flex; }
`);

mkdirSync(resolve(root, 'dist/chroma'), { recursive: true });
writeFileSync(resolve(root, 'dist/chroma/chroma.css'), out.join('\n'));

const count = Object.values(ROLES).reduce((n, r) => n + r.classes.length, 0);
console.log(`=== подсветка Chroma ===\n  ✓ dist/chroma/chroma.css: ${count} классов на ${Object.keys(ROLES).length} ролей, один профиль на обе темы`);
