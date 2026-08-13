/* Собирает fonts/ и src/styles/fonts.css из пакетов @fontsource.

   Запускать руками при смене шрифта: `node scripts/gen-fonts.mjs`.
   В обычной сборке не участвует — woff2 и fonts.css коммитятся.

   Нужен pyftsubset из fonttools с поддержкой woff2:
     pipx install fonttools && pipx inject fonttools brotli

   Зачем вообще резать. @fontsource/ibm-plex-sans уже разложен по unicode-range,
   его файлы просто копируются. А @fontsource/iosevka отдаёт один файл на 964 КБ,
   помеченный как «latin», внутри которого вся гарнитура целиком — 5706
   кодпоинтов вместе с кириллицей и греческим. Отдать такое читателю ради
   моноширинного кода нельзя, поэтому он режется на те же четыре сабсета.
*/

import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => resolve(root, ...p);

/* Диапазоны — те же, что раздаёт Google Fonts. Менять их без нужды нельзя:
   по ним же нарезан основной шрифт, и расхождение даст дырки в подстановке. */
const RANGES = {
  latin:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext':
    'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
  'cyrillic-ext': 'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
};

/* Моноширинному добавляется псевдографика: вывод `tree`, рамки `docker stats`,
   спарклайны в терминале. Без неё они рассыпаются на подстановочный шрифт и
   ломают выравнивание — ровно то, ради чего моноширинный и берут. */
const MONO_EXTRA = 'U+2500-257F, U+2580-259F, U+25A0-25FF, U+2630-2637, U+2190-21BB';

const FAMILIES = [
  {
    family: 'IBM Plex Sans',
    dir: 'ibm-plex-sans',
    pkg: '@fontsource/ibm-plex-sans',
    /* Курсив нужен обоих весов: em в прозе идёт нормальным, но попадает и
       внутрь заголовков и strong. Без 700i браузер синтезировал бы полужирный
       из 400i — ровно та беда, из-за которой ушли с Onest, у которого
       курсивного начертания нет вообще. */
    variants: [
      { style: 'normal', weights: [400, 700] },
      { style: 'italic', weights: [400, 700] },
    ],
    presubset: true, // уже разложен по сабсетам — только копируем
    note: 'Основной текст. Нейтральный гротеск с кириллицей и настоящим курсивом.',
  },
  {
    family: 'Iosevka',
    dir: 'iosevka',
    pkg: '@fontsource/iosevka',
    /* Курсив только в 400: моноширинным курсивом набраны комментарии в коде и
       .hljs-emphasis, оба нормального веса. Полужирный курсив в подсветке не
       встречается, а стоит он ещё 50 КБ в репозитории. Понадобится — сюда
       добавляется 700, файлы в пакете есть. */
    variants: [
      { style: 'normal', weights: [400, 700] },
      { style: 'italic', weights: [400] },
    ],
    presubset: false, // один файл на всю гарнитуру — режем сами
    source: (w, style) => `files/iosevka-latin-${w}-${style}.woff2`,
    extra: MONO_EXTRA,
    /* latin-ext коду не нужен: это фонетические расширения и латинская
       дополнительная — в блоке кода они не встречаются, а весят у Iosevka
       224 КБ на начертание. Что всё-таки попадётся, подставится основным
       шрифтом. */
    only: ['latin', 'cyrillic', 'cyrillic-ext'],
    note: 'Код, inline-код, клавиши, технические метки.',
  },
];

const allSubsets = Object.keys(RANGES);
const outDir = r('fonts');
const faces = [];

for (const f of FAMILIES) {
  const pkgDir = r('node_modules', f.pkg);
  try {
    statSync(pkgDir);
  } catch {
    throw new Error(`${f.pkg} не установлен — npm i -D ${f.pkg}`);
  }
  rmSync(resolve(outDir, f.dir), { recursive: true, force: true });
  mkdirSync(resolve(outDir, f.dir), { recursive: true });

  const cuts = f.variants.flatMap(({ style, weights }) => weights.map((weight) => ({ style, weight })));

  for (const { style, weight } of cuts) {
    for (const subset of f.only ?? allSubsets) {
      const outName = `${f.dir}-${weight}${style === 'italic' ? 'i' : 'n'}-${subset}.woff2`;
      const outPath = resolve(outDir, f.dir, outName);

      if (f.presubset) {
        const src = resolve(pkgDir, `files/${f.dir}-${subset}-${weight}-${style}.woff2`);
        try {
          statSync(src);
        } catch {
          continue; // у гарнитуры может не быть такого сабсета — это норма
        }
        cpSync(src, outPath);
      } else {
        const src = resolve(pkgDir, f.source(weight, style));
        const unicodes = (RANGES[subset] + (subset === 'latin' && f.extra ? ', ' + f.extra : ''))
          .replace(/U\+/g, '')
          .replace(/\s/g, '');
        execFileSync(
          'pyftsubset',
          /* без --layout-features=*: у Iosevka огромные наборы лигатур и
             стилистических альтернатив, в вебе они не используются, а вес
             дают кратный. Остаётся набор фич по умолчанию. */
          [src, `--unicodes=${unicodes}`, '--flavor=woff2', `--output-file=${outPath}`],
          { stdio: ['ignore', 'ignore', 'inherit'] },
        );
      }

      faces.push({
        family: f.family,
        dir: f.dir,
        weight,
        style,
        subset,
        file: outName,
        range: RANGES[subset] + (subset === 'latin' && f.extra ? ', ' + f.extra : ''),
        size: statSync(outPath).size,
      });
    }
  }
}

/* fonts.css. Пути относительные — dist/styles/../fonts/. Для Hugo сборка
   отдаёт fonts-hugo.css с абсолютными путями: Hugo склеивает CSS через
   resources.Concat и относительные URL не переписывает. */
const header = `/* СГЕНЕРИРОВАНО scripts/gen-fonts.mjs — не править руками.

   Шрифты self-hosted, оба под OFL-1.1, разрезаны на unicode-range сабсеты
   (latin / latin-ext / cyrillic / cyrillic-ext; у моноширинного latin-ext нет).
   Браузер тянет только те
   куски, которые реально встретились на странице.

${FAMILIES.map((f) => `     ${f.family} — ${f.note}`).join('\n')}

   У моноширинного в latin-сабсет добавлена псевдографика: вывод tree, рамки
   и спарклайны в терминале должны рисоваться той же гарнитурой, иначе
   выравнивание рассыпается.

   Курсив настоящий у обеих гарнитур. У основного шрифта он в 400 и 700, у
   моноширинного только в 400: им набраны комментарии в коде и .hljs-emphasis,
   оба нормального веса. */
`;

const css =
  header +
  faces
    .map(
      (f) => `
@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url('../fonts/${f.dir}/${f.file}') format('woff2');
  unicode-range: ${f.range};
}`,
    )
    .join('\n') +
  '\n';

writeFileSync(r('src/styles/fonts.css'), css);

const total = faces.reduce((n, f) => n + f.size, 0);
const byFamily = {};
for (const f of faces) byFamily[f.family] = (byFamily[f.family] ?? 0) + f.size;
console.log(`fonts.css: ${faces.length} @font-face`);
for (const [fam, size] of Object.entries(byFamily)) {
  console.log(`  ${fam}: ${(size / 1024).toFixed(0)} КБ`);
}
console.log(`итого ${(total / 1024).toFixed(0)} КБ`);
