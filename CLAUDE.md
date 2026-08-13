# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`@jtprogru/mishka-ds` — дизайн-система «Мишка на сервере»: токены, шрифты, знак и React-компоненты для блога (`hugo-mishka` / jtprog.ru), резюме (`savinmi.ru`, Astro), презентаций (`slidev-theme-bear`), схем mermaid и печати. Пакет собран из четырёх репозиториев, где одно и то же жило четырьмя копиями; вся архитектура подчинена тому, чтобы копии больше не появлялись.

## Команды

```bash
make install      # npm ci при наличии лока, иначе npm install
make build        # полная сборка dist/ (= npm run build)
make check        # css + typecheck + contrast, без сборки — дешёвая проверка перед коммитом
make demo         # сборка + витрина на http://localhost:4321/demo/ с watch и live reload
make serve        # витрина без пересборки и без watch
make css          # scripts/check-css.mjs — структурная проверка таблиц стилей
make contrast     # scripts/check-contrast.mjs — WCAG-пары в обеих темах
make typecheck    # tsc --noEmit
make mark         # пересобрать знак из brand/mishka-mark-source.svg
make fonts        # нарезка сабсетов шрифтов, ручной шаг, нужен pyftsubset
make skills-link  # симлинк skills/* в ~/.claude/skills
make pack         # npm pack --dry-run + npm pack
```

Тестового фреймворка нет и отдельных тестов тоже. Роль тестов играют три проверки, все они входят в `make check` и в `make build`: `check-css.mjs` (баланс комментариев и построчный разбор `tokens.css`), `check-contrast.mjs` (WCAG для всех текстовых пар, категориальной палитры и `--syn-*` в обеих темах, падает при провале порога), `tsc --noEmit`. Прогнать одну — соответствующая цель Makefile или `node scripts/<name>.mjs` напрямую.

## Архитектура

Единственный источник правды — `src/styles/tokens.css`. Всё остальное из него выводится:

```
src/styles/tokens.css
  ├─ tokens/tokens.json          (gen-tokens-json.mjs) — вход для инструментов, не умеющих CSS
  │    ├─ src/styles/themes-scoped.css   (build.mjs, inline)
  │    ├─ dist/mermaid/*.json            (gen-mermaid-theme.mjs)
  │    └─ dist/unocss/index.js           (gen-unocss-preset.mjs) — для Slidev
  ├─ src/styles/compat.css       (gen-compat.mjs) — алиасы старых имён трёх проектов
  └─ dist/styles/fonts-hugo.css  (build.mjs) — fonts.css с абсолютными путями для Hugo
```

`scripts/build.mjs` — единственный оркестратор, порядок шагов в нём существенный: знак → `check-css` → `tokens.json` → производные от токенов → копирование стилей → esbuild (ESM + CJS) → `.d.ts` → mermaid/unocss/contrast → бандл витрины. `check-css` стоит до генерации именно потому, что `tokens.json` собирается регуляркой и битого синтаксиса не замечает, а браузер по правилу восстановления теряет объявление молча.

CSS слоями, порядок `@import` в `src/styles/index.css` обязателен: `tokens → themes-scoped → compat → fonts → base → components → code → slides → print`. `dist/styles/mishka-ds.css` — плоская склейка тех же слоёв для потребителей, не разворачивающих `@import` (конвертер design-sync, инлайнеры).

React-слой собственных стилей не имеет. Компоненты выводят те же классы, что и Go-шаблоны темы `hugo-mishka` (`.callout--warn`, `.post-card__title`), поэтому `components.css` обслуживает и сайт, и превью. Добавляя компонент, добавляй класс в `components.css`, а не инлайновые стили; публичный API экспортируется из `src/index.ts` (значение и тип отдельными `export`/`export type`).

Тема включается тремя способами, и все три должны работать: `data-theme` на `:root` (сайт), `data-theme` на любом узле (превью и витрина, где светлая и тёмная стоят рядом), класс `dark`/`light` на `html` (Slidev). Отсюда генерация `themes-scoped.css`: дублировать три десятка значений руками — гарантированное расхождение. По той же причине генерится `compat.css` — кастомное свойство подставляет `var()` в момент объявления, поэтому алиасы надо переобъявлять в каждом блоке, где переключается тема.

## Что нельзя править руками

Перезапишется ближайшей сборкой: `src/styles/themes-scoped.css`, `src/styles/compat.css`, `src/components/markGeometry.ts`, `tokens/tokens.json`, `brand/mark.svg`, `brand/logo.svg`, `brand/mascot.svg`, знак внутри `brand/card.html`, `assets/cover.svg`, всё в `dist/`, `demo/demo.js`.

Обложка `assets/cover.svg` собирается `scripts/gen-cover.mjs` из трёх входов: цвета из `tokens/tokens.json`, знак из `brand/mark.svg`, `@font-face` из `src/styles/fonts.css` с вшитыми в data: URI сабсетами Onest. Правится генератор, а не результат. Растр `assets/cover.png` не коммитится: он нужен только для загрузки соцпревью в настройках GitHub, `make cover` делает его через `rsvg-convert`, если тот есть.

Знак редактируется в артворке `brand/mishka-mark-source.svg`, дальше `make mark`. Он одноцветный через инверсию в маску; порядок контуров в `MARK_PATHS` менять нельзя — детали морды рисуются поверх вырубки.

Шрифты пересобираются отдельно (`make fonts`, нужен `pyftsubset` из fonttools с woff2), результат в `fonts/` коммитится, поэтому обычная сборка их не трогает.

## Правила системы

Полная версия — `.design-sync/conventions.md` (он же `readmeHeader` для design-sync) и `BRAND.md`. Жёсткое:

- Палитра catppuccin: Latte на свету, Macchiato в темноте. Ровно один акцент — Sapphire. Второго акцентного цвета нет; нужен ещё цвет — это либо семантика callout, либо серия графика.
- Утилитарных классов в системе нет. Своя вёрстка — обычный CSS через переменные, без хардкод-хексов и произвольных пикселей.
- Ссылка-текст на светлом фоне — только `--accent-700`. `--accent-400` декоративный, `--accent-600` — крупный кегль, не body.
- Вертикальных акцентных полосок слева нет нигде: `border-left: 3px solid` убран из системы намеренно, не воспроизводить.
- `--fs-display-*` только для слайдов.
- Цвет не единственный носитель смысла: у графика подпись линии, у статуса слово, у callout иконка.
- Проза не набирается моноширинным.

Меняешь цвет, размер, отступ или радиус — правишь `src/styles/tokens.css` и запускаешь `make build`. Правка тех же значений внутри блога, резюме или темы слайдов — возврат к состоянию, из которого ушли.

## Документация

`README.md` — слои, установка, что отдаёт пакет, история проверок контраста. `BRAND.md` — бренд по поверхностям, устройство знака, голос. `MIGRATION.md` — порядок перевода четырёх потребителей, включая два токена, изменившихся по существу. `skills/README.md` — скиллы, живущие в пакете вместе с брендбуком (`mishka-deck`). `.design-sync/NOTES.md` — особенности синхронизации с Claude Design, включая обязательный `PLAYWRIGHT_BROWSERS_PATH`.

`dist/`, `ds-bundle/`, `.ds-sync/`, `uploads/`, `demo/demo.js` и `.design-sync/config.json` в `.gitignore`: на свежем клоне их нет, конвертеру и витрине нужен предварительный `make build`, а конфиг синхронизации делается из `.design-sync/config.example.json` (в нём `projectId`-плейсхолдер).

## Лицензирование

Репозиторий публичный, единой лицензии нет — `LICENSE` делит материалы на четыре режима: код, токены и стили под PolyForm Noncommercial 1.0.0; бренд (`brand/`, `src/components/markGeometry.ts`, `BearMark` в `site.tsx` и `print.tsx`, `BRAND.md`, имена) — все права защищены; документация под CC BY-NC-SA 4.0; шрифты в `fonts/` чужие, SIL OFL 1.1 с текстами рядом. Добавляешь файл, который относится к знаку или брендбуку, — впиши его в раздел 2 `LICENSE`, иначе он по умолчанию уедет под некоммерческую лицензию кода. Новый шрифт — рядом с бинарником кладётся его лицензия.
