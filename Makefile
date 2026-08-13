# Makefile mishka-ds. Тонкая обёртка над scripts/*.mjs: команды одинаково
# называются здесь, в CI и в голове. npm-скрипты остаются на месте — они нужны
# потребителям пакета, Makefile нужен тому, кто пакет разрабатывает.

SHELL := /bin/bash
.DEFAULT_GOAL := help

NPM  := npm
NODE := node

.PHONY: help install build tokens mark cover fonts css contrast typecheck check demo serve pack clean distclean skills-link

help: ## Список команд
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Поставить зависимости (ci при наличии лока, иначе install)
	@if [ -f package-lock.json ]; then $(NPM) ci; else $(NPM) install; fi

build: ## Полная сборка dist/ (знак, css-структура, токены, mermaid, unocss, контрасты)
	$(NPM) run build

tokens: ## Пересобрать tokens/tokens.json из src/styles/tokens.css
	$(NPM) run tokens

mark: ## Пересобрать знак из brand/mishka-mark-source.svg (markGeometry.ts, brand/*.svg, визитка)
	$(NODE) scripts/gen-mark-geometry.mjs

# PNG нужен только для соцпревью GitHub — в настройках репозитория загружается
# растр, SVG там не принимают. README и всё остальное живут на векторе.
cover: ## Пересобрать assets/cover.svg (обложка README и соцпревью)
	$(NODE) scripts/gen-cover.mjs
	@command -v rsvg-convert >/dev/null && rsvg-convert -w 1280 assets/cover.svg -o assets/cover.png \
		&& echo "✓ assets/cover.png — растр для соцпревью GitHub" \
		|| echo "· rsvg-convert не найден, PNG для соцпревью не собран (brew install librsvg)"

# Ручной шаг: нарезка сабсетов требует pyftsubset из fonttools с поддержкой
# woff2, а результат коммитится. Обычной сборке шрифты пересобирать незачем.
fonts: ## Пересобрать сабсеты шрифтов в fonts/ (нужен pyftsubset)
	$(NODE) scripts/gen-fonts.mjs

css: ## Структурная проверка таблиц стилей (баланс комментариев, разбор tokens.css)
	$(NODE) scripts/check-css.mjs

contrast: ## WCAG-контрасты всех текстовых пар в обеих темах
	$(NPM) run contrast

typecheck: ## tsc --noEmit
	$(NPM) run typecheck

# Три быстрые проверки без сборки dist/. Полная сборка гоняет css и contrast
# сама, но перед коммитом дешевле прогнать только их.
check: css typecheck contrast ## css + typecheck + contrast, без сборки

demo: ## Собрать и поднять витрину на http://localhost:4321/demo/ со слежением за исходниками
	$(NPM) run demo

serve: ## Поднять витрину без пересборки и без watch
	$(NODE) scripts/serve.mjs --no-watch

pack: build ## Собрать тарбол пакета и показать состав
	$(NPM) pack --dry-run
	$(NPM) pack

# Скиллы бренда живут в пакете, но Claude Code ищет их в ~/.claude/skills.
# Симлинк, а не копия: копия разойдётся с брендбуком.
skills-link: ## Прилинковать skills/* в ~/.claude/skills
	@mkdir -p $(HOME)/.claude/skills
	@for skill in skills/*/; do \
		name=$$(basename "$$skill"); \
		ln -sfn "$(CURDIR)/skills/$$name" "$(HOME)/.claude/skills/$$name"; \
		echo "  ~/.claude/skills/$$name -> $(CURDIR)/skills/$$name"; \
	done

clean: ## Удалить сборку
	rm -rf dist demo/demo.js *.tgz

distclean: clean ## Удалить сборку и node_modules
	rm -rf node_modules
