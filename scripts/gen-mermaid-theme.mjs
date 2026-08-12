/* Генерит темы mermaid из токенов дизайн-системы.

   Зачем скрипт, а не два JSON руками: ровно этот файл в jtprog.ru
   (scripts/mermaid-config*.json) отстал от BRANDING 0.2 и до сих пор рисует
   схемы в старой тёплой палитре (#c2410c / #fb923c / Inter). Пока конфиг
   копируется руками, он будет отставать снова. Теперь он выводится из
   tokens.json, и расхождение возможно только вместе с расхождением темы. */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens/tokens.json'), 'utf8'));

/** mermaid не понимает var() и color-mix() — сюда едут только развёрнутые hex. */
function themeFor(scheme) {
  const c = tokens.color[scheme];
  return {
    theme: 'base',
    themeVariables: {
      background: 'transparent',

      // Узлы: поверхность карточки, текст и рамка — как у .proj-card в UI.
      primaryColor: c['bg-elevated'],
      primaryTextColor: c.text,
      primaryBorderColor: c['border-strong'],
      secondaryColor: c['bg-sunken'],
      secondaryTextColor: c.text,
      secondaryBorderColor: c.border,

      // Третичный — единственное акцентное пятно на схеме (Sapphire).
      tertiaryColor: c['accent-soft'],
      tertiaryTextColor: c.text,
      tertiaryBorderColor: c['accent-400'],

      lineColor: c['text-muted'],
      textColor: c.text,

      mainBkg: c['bg-elevated'],
      secondBkg: c['bg-sunken'],
      nodeBorder: c['border-strong'],
      clusterBkg: c['bg-sunken'],
      clusterBorder: c.border,
      edgeLabelBackground: c.bg,

      noteBkgColor: c['accent-soft'],
      noteTextColor: c.text,
      noteBorderColor: c['accent-400'],

      // Ошибка: подложка нейтральная, смысл несёт цвет текста и рамки —
      // §8 BRANDING, цвет не единственный носитель смысла.
      errorBkgColor: c['bg-sunken'],
      errorTextColor: c['c-danger'],

      fontFamily: tokens.font['font-sans'],
      fontSize: '15px',
    },
  };
}

mkdirSync(resolve(root, 'dist/mermaid'), { recursive: true });
for (const [scheme, file] of [['light', 'mermaid-config.json'], ['dark', 'mermaid-config.dark.json']]) {
  writeFileSync(resolve(root, 'dist/mermaid', file), JSON.stringify(themeFor(scheme), null, 2) + '\n');
  console.log(`mermaid: dist/mermaid/${file} (${scheme})`);
}
