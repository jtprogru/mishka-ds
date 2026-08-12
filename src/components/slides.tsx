import type { HTMLAttributes, ReactNode } from 'react';

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/**
 * Слайд-примитивы повторяют лейауты slidev-theme-bear один в один по именам и
 * поведению. Это сделано ради одного: мокап, собранный здесь, переносится в
 * настоящий дек механически — `SlideFact` соответствует `layout: fact`,
 * `SlideSection` — `layout: section` и так далее.
 */

export type SlideVariant =
  | 'default'
  | 'cover'
  | 'intro'
  | 'section'
  | 'fact'
  | 'metric'
  | 'statement'
  | 'quote'
  | 'outro';

export interface SlideProps extends HTMLAttributes<HTMLElement> {
  variant?: SlideVariant;
  /** Подпись в подвале слайда: название доклада, площадка, дата. */
  footer?: ReactNode;
  /** Номер слайда. Ставить на всех, кроме обложки. */
  page?: number | string;
  /** Маскот в углу. Только обложка, раздел, финал — см. BRANDING §1. */
  mascot?: ReactNode;
  children?: ReactNode;
}

/** Холст 16:9. Всё остальное в этом файле — обёртки над ним. */
export function Slide({
  variant = 'default',
  footer,
  page,
  mascot,
  className,
  children,
  ...rest
}: SlideProps) {
  return (
    <section className={cx('slide', variant !== 'default' && `slide--${variant}`, className)} {...rest}>
      <div className="slide__body">{children}</div>
      {footer || page !== undefined ? (
        <div className="slide__footer">
          <span>{footer}</span>
          {page !== undefined ? <span className="slide__page">{page}</span> : null}
        </div>
      ) : null}
      {mascot ? <div className="slide__mascot">{mascot}</div> : null}
    </section>
  );
}

export interface DeckProps extends HTMLAttributes<HTMLDivElement> {
  /** storyboard — раскадровка сеткой; column — один слайд под другим. */
  layout?: 'column' | 'storyboard';
  children?: ReactNode;
}

/** Стопка слайдов: раскадровка доклада целиком. */
export function Deck({ layout = 'column', className, children, ...rest }: DeckProps) {
  return (
    <div className={cx('deck', layout === 'storyboard' && 'deck--storyboard', className)} {...rest}>
      {children}
    </div>
  );
}

/* ─────────────────────────── Типовые слайды ─────────────────────────── */

export interface SlideCoverProps extends Omit<SlideProps, 'variant' | 'title'> {
  title: ReactNode;
  /** Одна строка под заголовком: о чём доклад. */
  subtitle?: ReactNode;
}

/** Обложка. Одна на дек. Тёплая зона — здесь уместен маскот. */
export function SlideCover({ title, subtitle, children, ...rest }: SlideCoverProps) {
  return (
    <Slide variant="cover" {...rest}>
      <h1 className="slide__title">{title}</h1>
      {subtitle ? <p className="slide__lede">{subtitle}</p> : null}
      {children}
    </Slide>
  );
}

export interface SlideSectionProps extends Omit<SlideProps, 'variant' | 'title'> {
  title: ReactNode;
  kicker?: ReactNode;
  subtitle?: ReactNode;
}

/** Разделитель акта. Засечка под заголовком — акцентное пятно слайда. */
export function SlideSection({ title, kicker, subtitle, children, ...rest }: SlideSectionProps) {
  return (
    <Slide variant="section" {...rest}>
      {kicker ? <p className="slide__kicker">{kicker}</p> : null}
      <h2 className="slide__title">{title}</h2>
      {subtitle ? <p className="slide__lede">{subtitle}</p> : null}
      {children}
    </Slide>
  );
}

export interface SlideFactProps extends Omit<SlideProps, 'variant'> {
  /** Сама цифра. Одна на слайд — в этом весь смысл лейаута. */
  value: ReactNode;
  caption?: ReactNode;
  /** metric — тот же слайд под метрику, отличается только семантикой. */
  as?: 'fact' | 'metric';
}

/** Одна цифра во весь экран: кульминация или удар. */
export function SlideFact({ value, caption, as = 'fact', children, ...rest }: SlideFactProps) {
  return (
    <Slide variant={as} {...rest}>
      <p className="slide__title">{value}</p>
      {caption ? <p className="slide__lede">{caption}</p> : null}
      {children}
    </Slide>
  );
}

export interface SlideStatementProps extends Omit<SlideProps, 'variant'> {
  children?: ReactNode;
}

/** Одна фраза-тезис. Работает только если это действительно тезис. */
export function SlideStatement({ children, ...rest }: SlideStatementProps) {
  return (
    <Slide variant="statement" {...rest}>
      <h2 className="slide__title">{children}</h2>
    </Slide>
  );
}

export interface SlideQuoteProps extends Omit<SlideProps, 'variant'> {
  author?: ReactNode;
  children?: ReactNode;
}

/** Цитата с атрибуцией. Без автора цитата превращается в лозунг. */
export function SlideQuote({ author, children, ...rest }: SlideQuoteProps) {
  return (
    <Slide variant="quote" {...rest}>
      <figure className="slide__quote">
        <blockquote>{children}</blockquote>
      </figure>
      {author ? <p className="slide__quote-author">{author}</p> : null}
    </Slide>
  );
}

export interface SlideBulletsProps extends Omit<SlideProps, 'title'> {
  title?: ReactNode;
  items: ReactNode[];
}

/** Список. Три пункта и больше — иначе это не список, а абзац. */
export function SlideBullets({ title, items, children, ...rest }: SlideBulletsProps) {
  return (
    <Slide {...rest}>
      {title ? <h2 className="slide__title">{title}</h2> : null}
      <ul className="slide__list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {children}
    </Slide>
  );
}

export interface SlideTwoColsProps extends Omit<SlideProps, 'title'> {
  title?: ReactNode;
  left: ReactNode;
  right: ReactNode;
}

/** Две колонки: «было / стало», «миф / реальность». */
export function SlideTwoCols({ title, left, right, ...rest }: SlideTwoColsProps) {
  return (
    <Slide {...rest}>
      {title ? <h2 className="slide__title">{title}</h2> : null}
      <div className="slide__cols">
        <div className="slide__col">{left}</div>
        <div className="slide__col">{right}</div>
      </div>
    </Slide>
  );
}

export interface SlideOutroProps extends Omit<SlideProps, 'variant' | 'title'> {
  title: ReactNode;
  /** Ссылки и контакты. Последний слайд фотографируют — ему нужен адрес. */
  links?: ReactNode[];
}

/** Финал: что делать дальше и куда идти. */
export function SlideOutro({ title, links, children, ...rest }: SlideOutroProps) {
  return (
    <Slide variant="outro" {...rest}>
      <h2 className="slide__title">{title}</h2>
      {links?.length ? (
        <ul className="slide__links">
          {links.map((link, i) => (
            <li key={i}>{link}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </Slide>
  );
}
