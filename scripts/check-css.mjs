#!/usr/bin/env node
/*
 * Структурная проверка таблиц стилей. Ловит то, что не ловят остальные
 * проверки: CSS, синтаксически битый так, что браузер молча теряет объявления.
 *
 * Появилась после конкретного случая. В tokens.css пояснение к палитре легло
 * ПОСЛЕ закрывающего `*​/`, а не внутри комментария. Дальше сработало правило
 * восстановления CSS: парсер съел мусорную строку вместе со следующим за ней
 * объявлением, и `--chart-1` перестал существовать в светлой теме. При этом
 * `npm run contrast` был зелёным — он читает tokens.json, а тот собирается
 * регуляркой по строкам и мусора вокруг не замечает. Расхождение между «токен
 * есть в файле» и «токен доехал до браузера» держалось до первого взгляда
 * глазами.
 *
 *   node scripts/check-css.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = resolve(root, 'src/styles');

let failed = 0;
const problem = (file, msg) => {
  failed++;
  console.error(`  ✗ ${file}: ${msg}`);
};

/** Комментарии должны открываться и закрываться парой. CSS их не вкладывает. */
function checkComments(file, src) {
  let i = 0;
  let line = 1;
  let openLine = 0;
  let inside = false;
  while (i < src.length) {
    if (src[i] === '\n') line++;
    if (!inside && src.startsWith('/*', i)) {
      inside = true;
      openLine = line;
      i += 2;
      continue;
    }
    if (src.startsWith('*/', i)) {
      if (!inside) {
        problem(file, `строка ${line}: закрытие комментария без открытия — текст перед ним попадёт в CSS и утащит следующее объявление`);
      }
      inside = false;
      i += 2;
      continue;
    }
    i++;
  }
  if (inside) problem(file, `комментарий, открытый на строке ${openLine}, не закрыт до конца файла`);
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * tokens.css — плоский список объявлений внутри блоков. Всё, что не похоже на
 * объявление, селектор, скобку или at-правило, — мусор, который браузер съест
 * вместе с соседями.
 */
function checkTokenDeclarations(file, src) {
  const body = stripComments(src);
  body.split('\n').forEach((raw, idx) => {
    const s = raw.trim();
    if (!s) return;
    const ok =
      s.endsWith('{') || // начало блока
      s.endsWith(',') || // продолжение списка селекторов
      s.startsWith('}') ||
      s.startsWith('@') ||
      /\{.*\}$/.test(s) || // правило целиком в одну строку
      /^--?[\w-]+\s*:\s*[^;]+;$/.test(s) || // объявление токена
      /^[\w-]+\s*:\s*[^;]+;$/.test(s); // обычное объявление
    if (!ok) problem(file, `строка ${idx + 1}: не объявление и не селектор — «${s.slice(0, 60)}»`);
  });
}

console.log('=== структура таблиц стилей ===');
const files = readdirSync(stylesDir).filter((f) => f.endsWith('.css'));
for (const file of files) {
  const src = readFileSync(resolve(stylesDir, file), 'utf8');
  checkComments(file, src);
  if (file === 'tokens.css') checkTokenDeclarations(file, src);
}

if (failed) {
  console.error(`\n✗ ${failed} проблем(а) в CSS. Браузер потеряет объявления рядом с ними.`);
  process.exit(1);
}
console.log(`  ✓ ${files.length} файлов: комментарии закрыты, объявления целы.`);
