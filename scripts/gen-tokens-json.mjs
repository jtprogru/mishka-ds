/* Разбирает src/styles/tokens.css и раскладывает его в машиночитаемый
   tokens/tokens.json. Это не второй источник правды: CSS остаётся первичным,
   JSON генерится из него и нужен инструментам, которые CSS не умеют —
   генератору темы mermaid, скриптам обложек, дизайн-агенту.

   @media-блоки (prefers-contrast, min-width) сознательно пропускаются:
   в JSON едут только базовые light/dark и безусловные шкалы. */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');

/** Верхнеуровневые блоки `селектор { … }`; @media и комментарии пропускаем. */
function topLevelBlocks(source) {
  const blocks = [];
  let i = 0;
  let selectorStart = 0;
  while (i < source.length) {
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      if (source.slice(selectorStart, i).trim() === source.slice(selectorStart, i).trim()) selectorStart = i;
      continue;
    }
    if (source[i] === '{') {
      const selector = source.slice(selectorStart, i).trim();
      let depth = 1;
      let j = i + 1;
      while (j < source.length && depth > 0) {
        if (source.startsWith('/*', j)) { const e = source.indexOf('*/', j + 2); j = e === -1 ? source.length : e + 2; continue; }
        if (source[j] === '{') depth++;
        else if (source[j] === '}') depth--;
        j++;
      }
      if (!selector.startsWith('@')) blocks.push({ selector, body: source.slice(i + 1, j - 1) });
      i = j;
      selectorStart = i;
      continue;
    }
    i++;
  }
  return blocks;
}

/** `--name: value;` → { name: value }. Комментарии внутри значения обрезаются. */
function declarations(body) {
  const out = {};
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const line of clean.split(';')) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) out[m[1].slice(2)] = m[2].replace(/\s+/g, ' ').trim();
  }
  return out;
}

const light = {};
const dark = {};
const scale = {};

for (const { selector, body } of topLevelBlocks(css)) {
  const decls = declarations(body);
  if (selector.includes('data-theme="dark"')) Object.assign(dark, decls);
  else if (selector.includes('data-theme="light"')) Object.assign(light, decls);
  else if (/^:root$/.test(selector)) Object.assign(scale, decls);
}

/** Разворачивает var(--x) внутри карты (с падением в шкалу). */
function resolveMap(map, fallback = {}) {
  const seen = new Set();
  const resolveValue = (value, depth = 0) => {
    if (depth > 10) return value;
    return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_, name, def) => {
      const key = name.slice(2);
      const next = map[key] ?? fallback[key] ?? def;
      if (next === undefined) return _;
      return resolveValue(next.trim(), depth + 1);
    });
  };
  const out = {};
  for (const [k, v] of Object.entries(map)) {
    if (seen.has(k)) continue;
    seen.add(k);
    out[k] = resolveValue(v);
  }
  return out;
}

const group = (map, prefixes) =>
  Object.fromEntries(Object.entries(map).filter(([k]) => prefixes.some((p) => k.startsWith(p))));

const scaleResolved = resolveMap(scale);
const tokens = {
  $meta: {
    name: 'mishka-ds',
    branding: 'BRANDING 0.2 — catppuccin Latte/Macchiato, акцент Sapphire',
    source: 'src/styles/tokens.css',
    note: 'Файл сгенерирован scripts/gen-tokens-json.mjs. Руками не править.',
  },
  color: {
    light: resolveMap(light, scaleResolved),
    dark: resolveMap(dark, scaleResolved),
  },
  font: group(scaleResolved, ['font-']),
  fontSize: group(scaleResolved, ['fs-']),
  lineHeight: group(scaleResolved, ['lh-']),
  space: group(scaleResolved, ['gap-']),
  radius: group(scaleResolved, ['radius-']),
  size: group(scaleResolved, ['content-width', 'container-width', 'header-height']),
  motion: group(scaleResolved, ['transition']),
};

mkdirSync(resolve(root, 'tokens'), { recursive: true });
writeFileSync(resolve(root, 'tokens/tokens.json'), JSON.stringify(tokens, null, 2) + '\n');

const count = Object.keys(tokens.color.light).length + Object.keys(tokens.color.dark).length;
console.log(`tokens.json: ${count} цветовых токена, шкал — ${Object.keys(tokens.fontSize).length} размеров, ${Object.keys(tokens.space).length} отступов`);
