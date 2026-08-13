/* Собирает assets/cover.svg — обложку репозитория для README, соцпревью GitHub
   и любых других мест, где проект показывают картинкой.

   Почему генератор, а не нарисованный руками файл. Обложка показывает ровно то,
   чем система является: одну палитру в двух темах, знак и типографику. Всё это
   уже описано в tokens.css, и нарисованная копия разъехалась бы с ним при первой
   же правке цвета — тем же способом, каким разъехались конфиги mermaid в блоге.
   Здесь цвета берутся из tokens.json, знак — из brand/mark.svg, шрифтовые
   объявления — из src/styles/fonts.css. Меняешь токен, гоняешь сборку, обложка
   уже новая.

   Шрифты вшиты в SVG как data: URI. Картинку рендерят чужие площадки (GitHub
   проксирует её через camo, телеграм тянет как файл), внешний запрос к fonts/
   оттуда не уйдёт, а без Onest обложка дизайн-системы набралась бы системным
   гротеском. Вшиты только latin и cyrillic у двух начертаний — этого хватает на
   тексты обложки и держит файл в разумном весе.  */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r = (p) => resolve(root, p);

const tokens = JSON.parse(readFileSync(r('tokens/tokens.json'), 'utf8'));
const L = tokens.color.light;
const D = tokens.color.dark;

/* ── знак ───────────────────────────────────────────────────────────────────
   brand/mark.svg сам генерируется из артворка (scripts/gen-mark-geometry.mjs),
   поэтому геометрия читается оттуда, а не дублируется здесь. Нужны viewBox и
   тело маски; id переименовывается, чтобы не столкнуться ни с чем на странице,
   куда обложку могут заинлайнить. */
const markSvg = readFileSync(r('brand/mark.svg'), 'utf8');
const vb = markSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const maskBody = markSvg.match(/<mask id="bear-mark"[^>]*>([\s\S]*?)<\/mask>/);
if (!vb || !maskBody) throw new Error('brand/mark.svg: не разобрать viewBox или маску — сначала make mark');
const [, MARK_W, MARK_H] = vb.map(Number);
const MARK_MASK = maskBody[1].trimEnd();

/* ── шрифты ─────────────────────────────────────────────────────────────────
   Берём @font-face прямо из fonts.css и подменяем в них url на data: — так
   unicode-range остаётся тем же, что в пакете, и не превращается в третью копию
   диапазонов. */
const FACES = [
  'onest/onest-400n-latin.woff2',
  'onest/onest-400n-cyrillic.woff2',
  'onest/onest-700n-latin.woff2',
  'onest/onest-700n-cyrillic.woff2',
];

const fontsCss = readFileSync(r('src/styles/fonts.css'), 'utf8');
const blocks = fontsCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];

const embedded = FACES.map((file) => {
  const block = blocks.find((b) => b.includes(`/${file}'`));
  if (!block) throw new Error(`fonts.css: не найден @font-face для ${file} — сначала make fonts`);
  const b64 = readFileSync(r(`fonts/${file}`)).toString('base64');
  return block
    .replace(/src:\s*url\([^)]*\)[^;]*;/, `src: url(data:font/woff2;base64,${b64}) format('woff2');`)
    .replace(/\n\s*font-display:[^;]*;/, '')
    .replace(/\n {2}/g, '\n      ');
}).join('\n      ');

/* ── тексты ─────────────────────────────────────────────────────────────────
   Обе панели набраны одним и тем же текстом намеренно: смысл обложки в том, что
   тема меняет только цвет, а не композицию. Отношения контраста — не украшение,
   а живые числа из scripts/check-contrast.mjs (пара «ссылка / карточка»). */
const PANEL = {
  title: 'Один источник правды',
  body: ['Цвет, шрифты, ритм и правила — в tokens.css.', 'Всё остальное из него выводится.'],
};

const panel = (x, c, { label, link, ratio }) => `
  <g transform="translate(${x}, 326)">
    <rect width="548" height="236" rx="14" fill="${c['bg-elev']}" stroke="${c.border}"/>
    <path d="M0 40V14A14 14 0 0 1 14 0h520a14 14 0 0 1 14 14v26z" fill="${c['bg-sunken']}"/>
    <line x1="0" y1="40" x2="548" y2="40" stroke="${c.border}"/>
    <text class="mono" x="20" y="25" font-size="13" fill="${c['fg-subtle']}">${label}</text>

    <text class="sans" x="24" y="88" font-size="26" font-weight="700" fill="${c.fg}">${PANEL.title}</text>
    <text class="sans" x="24" y="122" font-size="16" fill="${c['fg-muted']}">${PANEL.body[0]}</text>
    <text class="sans" x="24" y="146" font-size="16" fill="${c['fg-muted']}">${PANEL.body[1]}</text>

    <text class="mono" x="24" y="186" font-size="15" fill="${c.accent}">${link}</text>
    <line x1="24" y1="192" x2="${24 + link.length * 9}" y2="192" stroke="${c.accent}" stroke-opacity="0.5"/>
    <text class="mono" x="${24 + link.length * 9 + 14}" y="186" font-size="15" fill="${c['fg-subtle']}">${ratio} AA</text>

    ${Array.from({ length: 8 }, (_, i) =>
      `<circle cx="${32 + i * 30}" cy="214" r="9" fill="${c[`chart-${i + 1}`]}"/>`,
    ).join('\n    ')}
    <text class="mono" x="${32 + 7 * 30 + 26}" y="219" font-size="13" fill="${c['fg-subtle']}">chart 1–8</text>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640" role="img" aria-label="mishka-ds — дизайн-система «Мишка на сервере»: токены, шрифты, знак и компоненты для блога, резюме, слайдов, схем и печати">
<!-- СГЕНЕРИРОВАНО scripts/gen-cover.mjs — не править руками.
     Цвета из tokens/tokens.json, знак из brand/mark.svg, шрифты из fonts/. -->
  <title>mishka-ds — дизайн-система «Мишка на сервере»</title>

  <defs>
    <linearGradient id="cover-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${D.bg}"/>
      <stop offset="60%" stop-color="${D['bg-elev']}"/>
      <stop offset="100%" stop-color="${D['bg-sunken']}"/>
    </linearGradient>

    <linearGradient id="cover-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${D['accent-700']}"/>
      <stop offset="100%" stop-color="${D['accent-300']}"/>
    </linearGradient>

    <radialGradient id="cover-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="${D['accent-300']}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${D['accent-300']}" stop-opacity="0"/>
    </radialGradient>

    <pattern id="cover-grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${D.fg}" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>

    <filter id="cover-shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000000" flood-opacity="0.45"/>
    </filter>

    <mask id="cover-mark" maskUnits="userSpaceOnUse" x="0" y="0" width="${MARK_W}" height="${MARK_H}">
${MARK_MASK}
    </mask>

    <style>
      ${embedded}
      .sans { font-family: Onest, ${tokens.font['font-sans'].replace(/^[^,]+,\s*/, '')} }
      .mono { font-family: ${tokens.font['font-mono']} }
    </style>
  </defs>

  <rect width="1280" height="640" fill="url(#cover-bg)"/>
  <rect width="1280" height="640" fill="url(#cover-grid)"/>
  <ellipse cx="1110" cy="170" rx="330" ry="260" fill="url(#cover-glow)"/>
  <rect width="1280" height="4" fill="url(#cover-rule)"/>

  <!-- знак: одноцветный по устройству, поэтому просто заливается акцентом -->
  <g transform="translate(1030, 74) scale(${(214 / MARK_H).toFixed(6)})">
    <rect width="${MARK_W}" height="${MARK_H}" fill="${D['accent-300']}" mask="url(#cover-mark)"/>
  </g>

  <g transform="translate(72, 96)">
    <rect width="330" height="28" rx="14" fill="${D['accent-300']}" fill-opacity="0.12" stroke="${D['accent-300']}" stroke-opacity="0.45"/>
    <text class="mono" x="16" y="19" font-size="13" letter-spacing="1.6" fill="${D['accent-300']}">TOKENS · CSS · REACT · SLIDEV · PRINT</text>

    <text class="sans" x="0" y="118" font-size="76" font-weight="700" letter-spacing="-1.5" fill="${D.fg}">mishka-ds</text>

    <text class="sans" x="2" y="164" font-size="24" fill="${D['fg-muted']}">Дизайн-система «Мишка на сервере». Один источник цвета,</text>
    <text class="sans" x="2" y="196" font-size="24" fill="${D['fg-muted']}">шрифтов, ритма и правил — вместо четырёх разошедшихся копий.</text>
  </g>

  <g filter="url(#cover-shadow)">
${panel(72, L, { label: 'data-theme="light" · catppuccin Latte', link: '--accent-700', ratio: '4.59:1' })}
${panel(660, D, { label: 'data-theme="dark" · catppuccin Macchiato', link: '--accent-300', ratio: '8.35:1' })}
  </g>

  <text class="mono" x="72" y="606" font-size="14" fill="${D['fg-subtle']}">tokens.css → tokens.json → themes · compat · mermaid · unocss</text>
  <text class="mono" x="1208" y="606" font-size="14" text-anchor="end" fill="${D['fg-subtle']}">github.com/jtprogru/mishka-ds</text>
</svg>
`;

mkdirSync(r('assets'), { recursive: true });
writeFileSync(r('assets/cover.svg'), svg);

const kb = (Buffer.byteLength(svg) / 1024).toFixed(0);
console.log(`✓ assets/cover.svg — 1280×640, шрифты вшиты, ${kb} КБ`);
