import type { ElementType, HTMLAttributes, ReactNode } from 'react';

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** narrow — колонка 720px под длинный текст; wide — сетка 1200px. */
  width?: 'wide' | 'narrow';
  as?: ElementType;
  children?: ReactNode;
}

/** Горизонтальный каркас страницы: max-width + боковые отступы. */
export function Container({ width = 'wide', as: Tag = 'div', className, children, ...rest }: ContainerProps) {
  return (
    <Tag className={cx('container', width === 'narrow' && 'main--narrow', className)} {...rest}>
      {children}
    </Tag>
  );
}

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Обёртка для потока текста: внутри неё работают стили контента —
 * заголовки, списки, inline-код, kbd, сноски.
 */
export function Prose({ className, children, ...rest }: ProseProps) {
  return (
    <div className={cx('md-content', className)} {...rest}>
      {children}
    </div>
  );
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Надзаголовок капсом: раздел, рубрика, тип материала. */
  kicker?: ReactNode;
  title: ReactNode;
  /** Подзаголовок в одну-две строки. */
  lede?: ReactNode;
  /** Мета-строка: дата, время чтения, счётчик. */
  meta?: ReactNode;
}

/** Единая шапка страницы. Один размер h1 на все шаблоны — иначе заголовки
 *  на соседних разделах встают на разной высоте. */
export function PageHeader({ kicker, title, lede, meta, className, children, ...rest }: PageHeaderProps) {
  return (
    <header className={cx('page-header', className)} {...rest}>
      {kicker ? <p className="page-header__kicker">{kicker}</p> : null}
      <h1 className="page-header__title">{title}</h1>
      {lede ? <p className="page-header__lede">{lede}</p> : null}
      {children}
      {meta ? <p className="page-header__meta">{meta}</p> : null}
    </header>
  );
}

export interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4';
  children?: ReactNode;
}

/** Заголовок секции с акцентной засечкой слева. */
export function SectionTitle({ as: Tag = 'h2', className, children, ...rest }: SectionTitleProps) {
  return (
    <Tag className={cx('section-title', className)} {...rest}>
      {children}
    </Tag>
  );
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** auto-fit — карточки от 280px; two — ровно две колонки на ≥768px. */
  variant?: 'auto-fit' | 'two';
  children?: ReactNode;
}

/** Сетка карточек. */
export function Grid({ variant = 'auto-fit', className, children, ...rest }: GridProps) {
  return (
    <div className={cx('grid', variant === 'auto-fit' ? 'grid--auto-fit' : 'grid--2', className)} {...rest}>
      {children}
    </div>
  );
}

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Доступное имя навигации. */
  label?: string;
}

/** Хлебные крошки. Последний элемент — текущая страница, ссылкой не делается. */
export function Breadcrumbs({ items, label = 'Хлебные крошки', className, ...rest }: BreadcrumbsProps) {
  return (
    <nav className={cx('breadcrumbs', className)} aria-label={label} {...rest}>
      <ol className="breadcrumbs__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              {item.href && !last ? <a href={item.href}>{item.label}</a> : <span aria-current={last ? 'page' : undefined}>{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
