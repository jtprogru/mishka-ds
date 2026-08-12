import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from './Icon';

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/* ============================ Callout ============================ */

export type CalloutType = 'note' | 'tip' | 'important' | 'warn' | 'danger';

/** Тип → иконка. Тот же маппинг, что в data/callouts.yaml темы. */
const calloutIcons: Record<CalloutType, IconName> = {
  note: 'info',
  tip: 'lightbulb',
  important: 'zap',
  warn: 'alert-triangle',
  danger: 'alert-octagon',
};

export interface CalloutProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * note — нейтральная информация, tip — совет, important — не пропустить,
   * warn — осторожно, danger — можно сломать прод.
   */
  type?: CalloutType;
  title?: ReactNode;
  children?: ReactNode;
}

/**
 * Врезка с семантическим цветом и иконкой.
 *
 * Смысл несут иконка и заголовок, а не только цвет: тона catppuccin
 * различаются слабее «продуктовых» палитр, опираться на один цвет нельзя.
 */
export function Callout({ type = 'note', title, className, children, ...rest }: CalloutProps) {
  return (
    <aside className={cx('callout', `callout--${type}`, className)} role="note" {...rest}>
      <div className="callout__icon" aria-hidden="true">
        <Icon name={calloutIcons[type]} size={20} />
      </div>
      <div className="callout__body">
        {title ? <p className="callout__title">{title}</p> : null}
        <div className="callout__content">{children}</div>
      </div>
    </aside>
  );
}

/* ============================ Код ============================ */

/** Подсветка: исходник и язык на входе, готовый HTML или null на выходе. */
export type Highlighter = (code: string, lang?: string) => string | null;

/* highlight.js не импортируется статически: он опциональная зависимость, и
   жёсткий импорт сделал бы её обязательной для всех потребителей. Объект
   принимается снаружи — из пропа, из глобали или из ленивой загрузки. */
function runHljs(hljs: unknown, code: string, lang?: string): string | null {
  const h = hljs as
    | {
        getLanguage?: (l: string) => unknown;
        highlight?: (c: string, o: { language: string }) => { value: string };
        highlightAuto?: (c: string) => { value: string };
      }
    | undefined;
  if (!h) return null;
  try {
    if (lang && h.getLanguage?.(lang) && h.highlight) {
      return h.highlight(code, { language: lang }).value;
    }
    return h.highlightAuto?.(code)?.value ?? null;
  } catch {
    return null; // сломанная грамматика не должна ронять страницу
  }
}

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Исходный текст. */
  code: string;
  /** Ярлык языка в правом верхнем углу, он же язык для подсветки. */
  lang?: string;
  /** Кнопка копирования. Требует secure context (https/localhost). */
  copyable?: boolean;
  copyLabel?: string;
  /**
   * Своя подсветка. Синхронная, поэтому работает и при серверном рендере —
   * в отличие от ленивой загрузки, которая доступна только в браузере.
   */
  highlight?: Highlighter;
}

/**
 * Блок кода с ярлыком языка, копированием и подсветкой синтаксиса.
 *
 * Подсветка ищется в трёх местах, в порядке убывания надёжности: проп
 * `highlight`, глобальный `hljs` (если подключён тегом script), ленивая
 * загрузка `highlight.js/lib/common`. Не нашлось ничего — блок рендерит
 * простой текст, и это рабочее состояние, а не ошибка.
 *
 * Цвета берутся из токенов `--syn-*` через `code.css`.
 */
export function CodeBlock({
  code,
  lang,
  copyable = true,
  copyLabel = 'Скопировать код',
  highlight,
  className,
  ...rest
}: CodeBlockProps) {
  const [done, setDone] = useState(false);
  const [lazyHljs, setLazyHljs] = useState<unknown>(null);

  const globalHljs = (globalThis as { hljs?: unknown }).hljs;

  const html = useMemo(() => {
    if (highlight) return highlight(code, lang);
    return runHljs(globalHljs ?? lazyHljs, code, lang);
  }, [highlight, code, lang, globalHljs, lazyHljs]);

  useEffect(() => {
    if (highlight || globalHljs || lazyHljs) return;
    let cancelled = false;
    import('highlight.js/lib/common')
      .then((m) => {
        if (!cancelled) setLazyHljs((m as { default?: unknown }).default ?? m);
      })
      .catch(() => {
        /* пакет не установлен — остаётся простой текст */
      });
    return () => {
      cancelled = true;
    };
  }, [highlight, globalHljs, lazyHljs]);

  const copy = useCallback(() => {
    void navigator.clipboard?.writeText(code).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    });
  }, [code]);

  return (
    <div className={cx('codeblock', className)} {...rest}>
      {lang ? <span className="codeblock__lang">{lang}</span> : null}
      {copyable ? (
        <button
          type="button"
          className={cx('codeblock__copy', done && 'is-done')}
          onClick={copy}
          aria-label={copyLabel}
        >
          <Icon name={done ? 'check' : 'copy'} size={16} />
        </button>
      ) : null}
      <pre>
        {html ? (
          <code
            className={cx('hljs', lang && `language-${lang}`)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <code className={cx('hljs', lang && `language-${lang}`)}>{code}</code>
        )}
      </pre>
    </div>
  );
}

export interface InlineCodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Инлайн-код внутри прозы. */
export function InlineCode({ className, children, ...rest }: InlineCodeProps) {
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLSpanElement> {
  /** Комбинация: ['Cmd', 'Shift', 'P'] либо строка 'Cmd+Shift+P'. */
  keys: string[] | string;
  separator?: string;
}

/** Клавиши и их комбинации. */
export function Kbd({ keys, separator = '+', className, ...rest }: KbdProps) {
  const parts = (typeof keys === 'string' ? keys.split('+') : keys).map((k) => k.trim());
  return (
    <span className={cx('kbd-combo', className)} {...rest}>
      {parts.map((key, i) => (
        <Fragment key={`${key}-${i}`}>
          {i > 0 ? <span className="kbd-combo__sep">{separator}</span> : null}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </span>
  );
}

/* ============================ Раскрывашка ============================ */

export interface CollapseProps extends HTMLAttributes<HTMLDetailsElement> {
  summary: ReactNode;
  defaultOpen?: boolean;
  children?: ReactNode;
}

/** Свёрнутый блок: длинный вывод команды, необязательное отступление. */
export function Collapse({ summary, defaultOpen = false, className, children, ...rest }: CollapseProps) {
  return (
    <details className={cx('collapse', className)} open={defaultOpen} {...rest}>
      <summary className="collapse__summary">{summary}</summary>
      <div className="collapse__content">{children}</div>
    </details>
  );
}

/* ============================ Цитаты ============================ */

export interface QuoteProps extends HTMLAttributes<HTMLQuoteElement> {
  children?: ReactNode;
  /** Источник цитаты — выводится под текстом. */
  cite?: ReactNode;
}

/** Обычная цитата. */
export function Quote({ cite, className, children, ...rest }: QuoteProps) {
  return (
    <blockquote className={cx('quote', className)} {...rest}>
      {children}
      {cite ? <footer className="quote__cite">{cite}</footer> : null}
    </blockquote>
  );
}

export interface ThinPlaceProps extends HTMLAttributes<HTMLElement> {
  author?: ReactNode;
  children?: ReactNode;
}

/**
 * «Тонкое место» — крупная цитата с открывающей кавычкой и воздухом вокруг.
 * Смысловая пауза в эссе, не украшение: одна на текст, максимум две.
 *
 * Отличается от Quote весом, а не цветом: Quote — короткая ссылка на чужие
 * слова в потоке, ThinPlace — остановка. Тире перед автором ставит CSS.
 */
export function ThinPlace({ author, className, children, ...rest }: ThinPlaceProps) {
  return (
    <figure className={cx('thin-place', className)} {...rest}>
      <blockquote className="thin-place__quote">{children}</blockquote>
      {author ? <figcaption className="thin-place__author">{author}</figcaption> : null}
    </figure>
  );
}

/* ============================ Баннеры ============================ */

export interface RefreshBannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Короткая метка слева, например «актуализировано». */
  label?: ReactNode;
  children?: ReactNode;
}

/** Плашка «текст обновлён» над старым материалом. */
export function RefreshBanner({ label = 'актуализировано', className, children, ...rest }: RefreshBannerProps) {
  return (
    <div className={cx('refresh-banner', className)} {...rest}>
      <span className="refresh-banner__dot" aria-hidden="true" />
      <span className="refresh-banner__label">{label}</span>
      <span className="refresh-banner__text">{children}</span>
    </div>
  );
}

export interface CtaCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  actionLabel: ReactNode;
  href: string;
}

/**
 * Карточка призыва к действию: иконка, текст, кнопка-пилюля.
 *
 * Классы исторически называются telegram-cta — шаблон темы завязан на них.
 * Компонент общий: подписка, ссылка на репозиторий, контакт в резюме.
 */
export function CtaCard({ icon, title, text, actionLabel, href, className, ...rest }: CtaCardProps) {
  return (
    <div className={cx('telegram-cta', className)} {...rest}>
      {icon ? (
        <div className="telegram-cta__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="telegram-cta__body">
        <p className="telegram-cta__title">{title}</p>
        {text ? <p className="telegram-cta__text">{text}</p> : null}
      </div>
      <a className="telegram-cta__link" href={href}>
        {actionLabel}
      </a>
    </div>
  );
}
