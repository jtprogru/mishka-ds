/* Сборка mishka-ds.

   Порядок важен: tokens.json генерится первым — из него выводятся
   scoped-темы и конфиги mermaid. */

import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => resolve(root, ...p);
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });

rmSync(r('dist'), { recursive: true, force: true });
mkdirSync(r('dist/styles'), { recursive: true });

/* 0. Знак из артворка: markGeometry.ts + brand/*.svg + визитка. Дёшево и
      детерминированно, поэтому гоняется каждую сборку — иначе правка рисунка
      доезжает до компонента, но не до brand/, и они расходятся. */
run(process.execPath, ['scripts/gen-mark-geometry.mjs']);

/* 0b. Структура CSS — до всего, что выводится из токенов. tokens.json
      собирается регуляркой и битого синтаксиса вокруг не замечает; браузер
      замечает и тихо теряет объявление. Проверка стоит здесь, чтобы сборка
      падала раньше, чем потерянный токен доедет до превью и до прода. */
run(process.execPath, ['scripts/check-css.mjs']);

/* 1. Токены в JSON — вход для всего остального. */
run(process.execPath, ['scripts/gen-tokens-json.mjs']);
const tokens = JSON.parse(readFileSync(r('tokens/tokens.json'), 'utf8'));

/* 2. Scoped-темы.

   tokens.css объявляет тёмную тему только на :root — так работает сайт с одним
   переключателем. Но превью, демо и скриншоты для дизайн-агента показывают обе
   темы на одной странице, а для этого data-theme должен работать на любом узле.
   Файл генерится, а не пишется руками: дублировать 30 значений вручную —
   гарантированное расхождение. */
const declsFor = (scheme) =>
  Object.entries(tokens.color[scheme])
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n');

/* Два разных потребителя, одни и те же значения:
   - [data-theme]:not(:root) — превью, где светлая и тёмная стоят рядом;
   - html.dark / .theme-dark — Slidev и всё, что переключает тему классом. */
const scopedBlock = (scheme) =>
  `[data-theme="${scheme}"]:not(:root) {\n${declsFor(scheme)}\n  background: var(--bg);\n  color: var(--fg);\n}`;

const classBlock = (scheme) =>
  `${scheme === 'dark' ? 'html.dark, .theme-dark' : 'html.light, .theme-light'} {\n${declsFor(scheme)}\n}`;

writeFileSync(
  r('src/styles/themes-scoped.css'),
  [
    '/* СГЕНЕРИРОВАНО scripts/build.mjs из tokens.json. Руками не править.',
    '   Тема включается тремя способами: data-theme на :root (сайт), data-theme',
    '   на любом элементе (превью), класс dark/light на html (Slidev). */',
    '',
    scopedBlock('light'),
    '',
    scopedBlock('dark'),
    '',
    classBlock('light'),
    '',
    classBlock('dark'),
    '',
  ].join('\n'),
);

/* 2b. Алиасы старых имён — тоже генерятся, и по той же причине. */
run(process.execPath, ['scripts/gen-compat.mjs']);

/* 3. Стили в dist. */
for (const file of readdirSync(r('src/styles'))) {
  if (file.endsWith('.css')) cpSync(r('src/styles', file), r('dist/styles', file));
}

/* 4. Вариант fonts.css для Hugo.

   Hugo склеивает модули CSS через resources.Concat и относительные URL не
   переписывает — теме нужны абсолютные пути от корня сайта. */
writeFileSync(
  r('dist/styles/fonts-hugo.css'),
  readFileSync(r('src/styles/fonts.css'), 'utf8').replace(/url\('\.\.\/fonts\//g, "url('/fonts/"),
);

/* 4b. Плоская таблица: все слои склеены в один файл в порядке импорта.
      Нужна тем, кто не умеет разворачивать дерево @import — конвертеру
      design-sync, инлайнерам, сборщикам без поддержки CSS-модулей. Пути к
      шрифтам остаются валидными: файл лежит в том же каталоге, что и fonts.css. */
{
  const order = ['tokens.css', 'themes-scoped.css', 'compat.css', 'fonts.css', 'base.css', 'components.css', 'code.css', 'slides.css', 'print.css'];
  const flat = order
    .map((name) => `/* ========== ${name} ========== */\n` + readFileSync(r('src/styles', name), 'utf8'))
    .join('\n');
  writeFileSync(r('dist/styles/mishka-ds.css'), flat);
}

/* 5. Шрифты — рядом со стилями, чтобы относительные пути сошлись. Знак,
      логотип и маскот едут туда же: потребителю нужен один каталог. */
cpSync(r('fonts'), r('dist/fonts'), { recursive: true });
cpSync(r('brand'), r('dist/brand'), { recursive: true });

/* 6. JS-бандлы. React — peer-зависимость, в бандл не едет. */
const common = {
  entryPoints: [r('src/index.ts')],
  bundle: true,
  /* highlight.js внешний: он опциональный, в бандл его тянуть нельзя. */
  external: ['react', 'react-dom', 'react/jsx-runtime', 'highlight.js', 'highlight.js/lib/common'],
  jsx: 'automatic',
  target: ['es2022'],
  logLevel: 'warning',
};
await build({ ...common, format: 'esm', outfile: r('dist/index.js') });
await build({ ...common, format: 'cjs', outfile: r('dist/index.cjs') });

/* 7. Типы. */
run(process.execPath, ['node_modules/typescript/bin/tsc', '--emitDeclarationOnly', '--outDir', 'dist']);

/* 8. Производные от токенов: темы mermaid, пресет UnoCSS, обложка репозитория,
      проверка контрастов. Обложка здесь по той же причине, что и знак в шаге 0:
      она показывает палитру в обеих темах, и нарисованная копия разъехалась бы
      с токенами при первой правке цвета. */
run(process.execPath, ['scripts/gen-mermaid-theme.mjs']);
run(process.execPath, ['scripts/gen-unocss-preset.mjs']);
run(process.execPath, ['scripts/gen-cover.mjs']);
run(process.execPath, ['scripts/check-contrast.mjs']);

/* 9. Демо-страница: React внутрь бандла, чтобы demo/index.html открывался
      двойным кликом без сервера и без сети. */
await build({
  entryPoints: [r('demo/demo.tsx')],
  bundle: true,
  jsx: 'automatic',
  format: 'iife',
  target: ['es2022'],
  outfile: r('demo/demo.js'),
  logLevel: 'warning',
  /* В витрине highlight.js бандлится внутрь: страница должна открываться
     двойным кликом без сети. В пакете он остаётся внешним. */
  alias: { '@jtprogru/mishka-ds': r('src/index.ts') },
});

console.log('\nсобрано: dist/index.js, dist/index.cjs, dist/index.d.ts, dist/styles/*, dist/mermaid/*, demo/demo.js');
