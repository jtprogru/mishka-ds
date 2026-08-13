/* Извлекает геометрию знака из исходного артворка в src/components/markGeometry.ts.

   Запускать руками, когда меняется рисунок: `node scripts/gen-mark-geometry.mjs`.
   В обычной сборке не участвует — результат коммитится.

   Артворк нарисован в Illustrator: чернила чёрные, бумага белая, классы задают
   заливку и обводку. Знаку нужен один цвет, поэтому цвета инвертируются в маску:
   чернила становятся видимой частью, бумага — дыркой. Тогда <rect fill=currentColor
   mask=...> даёт силуэт, который одинаково работает на светлом и на тёмном.
*/

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r = (p) => resolve(root, p);

const SOURCE = 'brand/mishka-mark-source.svg';
const src = readFileSync(r(SOURCE), 'utf8');

/* viewBox и общий сдвиг всех контуров — артворк экспортирован со смещением. */
const viewBox = src.match(/viewBox="([^"]+)"/)[1];
const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
const transform = (src.match(/transform="(translate\([^)]+\))"/) ?? [, null])[1];

/* Роль контура в знаке определяется классом артворка. */
const ROLE = {
  null: 'ink', // без класса — чёрная заливка по умолчанию
  'cls-1': 'paper', // белая заливка без обводки: табличка, морда
  'cls-2': 'capOutline', // кепка: белая заливка, обводка 0.25
  'cls-3': 'lensOutline', // очки: белая заливка, обводка 0.1
  'cls-4': 'tint', // диаграмма на табличке: чёрное с прозрачностью 0.2
};

const paths = [...src.matchAll(/<path([^>]*?)\sd="([^"]+)"([^>]*?)\/>/g)];
if (!paths.length) throw new Error(`${SOURCE}: не найдено ни одного <path>`);

/* Порядок контуров сохраняется как в артворке. Это не косметика: нос и рот —
   чернила поверх морды, а морда — вырубка поверх головы. Сгруппируй по ролям, и
   вырубка затрёт детали, которые рисуются после неё. */
const ordered = [];
const seen = new Set();
let dropped = 0;

for (const m of paths) {
  const attrs = m[1] + m[3];
  const d = m[2].trim();
  const cls = (attrs.match(/class="([^"]+)"/) ?? [, null])[1];
  const role = ROLE[cls];
  if (!role) throw new Error(`${SOURCE}: неизвестный класс "${cls}" — добавь его в ROLE`);
  if (!/[LlHhVvCcSsQqTtAaZz]/.test(d)) {
    dropped++; // огрызки вроде "M364.8,783.21": одно перо, ни одной команды рисования
    continue;
  }
  const key = role + '|' + d;
  if (seen.has(key)) {
    dropped++; // артворк содержит продублированные контуры
    continue;
  }
  seen.add(key);
  ordered.push({ d, role });
}

const counts = ordered.reduce((acc, p) => ({ ...acc, [p.role]: (acc[p.role] ?? 0) + 1 }), {});

const out = `/* СГЕНЕРИРОВАНО scripts/gen-mark-geometry.mjs из ${SOURCE} — не править руками.

   Единственный источник геометрии знака. Из него строятся и React-компонент
   BearMark, и файлы brand/*.svg (scripts/gen-brand-svg.mjs). Раньше знак жил в
   трёх местах и расходился — теперь место одно.

   Знак одноцветный, поэтому цвета артворка инвертируются в маску: чернила
   становятся видимой частью, бумага — дыркой. Порядок контуров — как в
   артворке, менять нельзя: детали морды рисуются поверх вырубки.
*/

/** Роль контура в маске знака. */
export type MarkRole =
  /** чернила: видимая часть силуэта */
  | 'ink'
  /** вырубка: дырка, сквозь которую видно фон */
  | 'paper'
  /** кепка: вырубка с обводкой 0.25 — обводка остаётся видимой */
  | 'capOutline'
  /** очки: вырубка с обводкой 0.1 */
  | 'lensOutline'
  /** диаграмма на табличке: полупрозрачная деталь поверх вырубки */
  | 'tint';

export interface MarkPath {
  d: string;
  role: MarkRole;
}

/** Пропорция знака: он выше, чем шире. Ширина = высота × MARK_RATIO. */
export const MARK_RATIO = ${(vbW / vbH).toFixed(6)};

export const MARK_VIEWBOX = '${viewBox}';
export const MARK_WIDTH = ${vbW};
export const MARK_HEIGHT = ${vbH};
export const MARK_TRANSFORM${transform ? '' : ': string'} = ${transform ? `'${transform}'` : "''"};

/** Толщина обводки для ролей, которые её сохраняют. */
export const MARK_STROKE_WIDTH: Record<'capOutline' | 'lensOutline', number> = {
  capOutline: 0.25,
  lensOutline: 0.1,
};

export const MARK_PATHS: readonly MarkPath[] = [
${ordered.map((p) => `  { d: '${p.d}', role: '${p.role}' },`).join('\n')}
];
`;

writeFileSync(r('src/components/markGeometry.ts'), out);

/* ── brand/*.svg из той же геометрии ─────────────────────────────────────────
   Знак раньше был скопирован в mark.svg, logo.svg и в компонент — три копии,
   которые расходились при любой правке. Теперь копия одна, остальное строится. */

const maskBody = (indent, extraTransform) => {
  const t = [extraTransform, transform].filter(Boolean).join(' ');
  const rows = ordered.map(({ d, role }) => {
    if (role === 'ink') return `${indent}  <path fill="#fff" d="${d}"/>`;
    if (role === 'paper') return `${indent}  <path fill="#000" d="${d}"/>`;
    if (role === 'tint') return `${indent}  <path fill="#fff" fill-opacity="0.2" d="${d}"/>`;
    const w = role === 'capOutline' ? 0.25 : 0.1;
    return `${indent}  <path fill="#000" stroke="#fff" stroke-width="${w}" stroke-miterlimit="10" d="${d}"/>`;
  });
  return `${indent}<g${t ? ` transform="${t}"` : ''}>\n${rows.join('\n')}\n${indent}</g>`;
};

const GENERATED = `<!-- СГЕНЕРИРОВАНО scripts/gen-mark-geometry.mjs из ${SOURCE} — не править руками. -->`;

writeFileSync(
  r('brand/mark.svg'),
  `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мишка на сервере">
${GENERATED}
  <!--
    ЗНАК. Одноцветный по устройству: геометрия собрана в маску, где чернила
    видимы, а бумага — сквозная дырка. Заливка currentColor, поэтому знак
    наследует цвет текста и одинаково работает на светлом и на тёмном.

    Знак не квадратный: ${vbW}×${vbH}, пропорция ${(vbW / vbH).toFixed(4)}.
    Задавать высоту, ширину считать по пропорции, иначе получится растяжка.
  -->
  <mask id="bear-mark" maskUnits="userSpaceOnUse" x="0" y="0" width="${vbW}" height="${vbH}">
${maskBody('    ', null)}
  </mask>
  <rect width="${vbW}" height="${vbH}" fill="currentColor" mask="url(#bear-mark)"/>
</svg>
`,
);

/* Логотип = знак + словесный знак. Знак масштабируется под высоту строки, а
   сдвиг и масштаб вписываются прямо в маску: так ни один движок не спорит о
   том, в какой системе координат живёт maskUnits. */
const LOGO_H = 64;
const LOGO_W = 340;
const markH = 56;
const scale = markH / vbH;
const markW = vbW * scale;
const textX = Math.round(markW + 16);

writeFileSync(
  r('brand/logo.svg'),
  `<svg viewBox="0 0 ${LOGO_W} ${LOGO_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мишка на сервере">
${GENERATED}
  <!--
    ЛОГОТИП = знак + словесный знак. Обе части наследуют currentColor.

    Словесный знак набран IBM Plex Sans Bold — тем же шрифтом, что и заголовки во всех
    поверхностях. Отдельной шрифтовой пары под логотип нет и не нужно: единство
    держится на том, что логотип набран шрифтом бренда, а не нарисован отдельно.

    Минимальная ширина при печати — 28 мм, ниже словесный знак перестаёт
    читаться и надо ставить один знак.
  -->
  <mask id="bear-logo" maskUnits="userSpaceOnUse" x="0" y="0" width="${LOGO_W}" height="${LOGO_H}">
${maskBody('    ', `translate(0 ${(LOGO_H - markH) / 2}) scale(${scale.toFixed(6)})`)}
  </mask>
  <rect width="${LOGO_W}" height="${LOGO_H}" fill="currentColor" mask="url(#bear-logo)"/>
  <text x="${textX}" y="42" font-family="'IBM Plex Sans', system-ui, sans-serif" font-size="28" font-weight="700" fill="currentColor">Мишка на сервере</text>
</svg>
`,
);

/* Маскот. Тот же медведь, но крашеный, а не вырубленный: маскот — единственное
   место, где бренду разрешено быть тёплым (BRAND.md §0), и силуэт эту теплоту не
   передаёт. Оба тона взяты из системы: тёмный — Peach из шкалы --c-warn-text,
   светлый — --bg. Своих цветов у маскота нет. */
const MASCOT_INK = '#9a3f0a';
const MASCOT_PAPER = '#eff1f5';

const paintedBody = (indent) => {
  const rows = ordered.map(({ d, role }) => {
    if (role === 'ink') return `${indent}  <path fill="${MASCOT_INK}" d="${d}"/>`;
    if (role === 'paper') return `${indent}  <path fill="${MASCOT_PAPER}" d="${d}"/>`;
    if (role === 'tint') return `${indent}  <path fill="${MASCOT_INK}" fill-opacity="0.2" d="${d}"/>`;
    const w = role === 'capOutline' ? 0.25 : 0.1;
    return `${indent}  <path fill="${MASCOT_PAPER}" stroke="${MASCOT_INK}" stroke-width="${w}" stroke-miterlimit="10" d="${d}"/>`;
  });
  return `${indent}<g${transform ? ` transform="${transform}"` : ''}>\n${rows.join('\n')}\n${indent}</g>`;
};

writeFileSync(
  r('brand/mascot.svg'),
  `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Маскот «Мишка на сервере»">
${GENERATED}
  <!--
    МАСКОТ. Тот же медведь, что и знак, но крашеный в два тона, а не вырубленный.
    Знак живёт монохромным и наследует цвет текста; маскот несёт теплоту бренда
    (BRAND.md §0) и потому имеет собственные заливки.

    Оба тона — из системы: ${MASCOT_INK} (Peach, шкала --c-warn-text) и
    ${MASCOT_PAPER} (--bg). Оранжевого #fb923c из палитры 0.1 здесь больше нет.
  -->
${paintedBody('  ')}
</svg>
`,
);

/* Визитка держала пятую копию знака инлайном. Теперь тоже собирается. */
const cardPath = r('brand/card.html');
const card = readFileSync(cardPath, 'utf8');
const START = '<!-- MARK:START';
const END = '<!-- MARK:END -->';
const from = card.indexOf(START);
const to = card.indexOf(END);
if (from === -1 || to === -1) throw new Error('brand/card.html: не найдены маркеры MARK:START / MARK:END');
const cardMarkH = 10; // мм — как было
const cardMarkW = +(cardMarkH * (vbW / vbH)).toFixed(2);
const cardSvg = `${START} — вставляется scripts/gen-mark-geometry.mjs, не править руками -->
          <svg width="${cardMarkW}mm" height="${cardMarkH}mm" viewBox="${viewBox}" aria-hidden="true" style="color: var(--accent-300)">
            <mask id="card-mark" maskUnits="userSpaceOnUse" x="0" y="0" width="${vbW}" height="${vbH}">
${maskBody('              ', null)}
            </mask>
            <rect width="${vbW}" height="${vbH}" fill="currentColor" mask="url(#card-mark)"/>
          </svg>
          `;
writeFileSync(cardPath, card.slice(0, from) + cardSvg + card.slice(to));

console.log(
  `записано: brand/mark.svg, brand/logo.svg (знак ${markW.toFixed(1)}×${markH}), ` +
    `brand/mascot.svg, brand/card.html`,
);

console.log(
  `знак: ${ordered.length} контуров (` +
    Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ') +
    `), отброшено дублей и пустышек: ${dropped}`,
);
console.log(`пропорция ${vbW}×${vbH} → ${(vbW / vbH).toFixed(4)}`);
console.log('записано: src/components/markGeometry.ts');
