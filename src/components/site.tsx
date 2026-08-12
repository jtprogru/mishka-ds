import { useId } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import {
  MARK_HEIGHT,
  MARK_PATHS,
  MARK_RATIO,
  MARK_STROKE_WIDTH,
  MARK_TRANSFORM,
  MARK_VIEWBOX,
  MARK_WIDTH,
} from './markGeometry';

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/* ─────────────────────────── Знак ─────────────────────────── */

export interface BearMarkProps extends HTMLAttributes<SVGSVGElement> {
  /** Высота знака в пикселях. Ширина считается по пропорции — знак не квадратный. */
  size?: number;
  /** Доступное имя. Рядом с текстовым названием знак декоративен. */
  title?: string;
}

/**
 * Знак: медведь в кепке и очках с табличкой «облако и стойки», залитый currentColor.
 * Живёт там, где мало места или серьёзный контекст — шапка, подвал, визитка, фавикон.
 *
 * Одноцветный по устройству: геометрия собрана в маску, где чернила видимы, а
 * бумага — сквозная дырка. Поэтому знак наследует цвет текста и одинаково
 * работает на светлом и на тёмном, без переключения по теме.
 *
 * @example
 * <BearMark size={32} title="Мишка на сервере" />
 */
export function BearMark({ size = 32, title, className, ...rest }: BearMarkProps) {
  // Маска уникальна на экземпляр: два знака на странице с общим id — невалидный DOM.
  // Двоеточия из useId в url(#…) понимают не все движки, поэтому убираются.
  const maskId = `bear-mark-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={Math.round(size * MARK_RATIO * 100) / 100}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={MARK_WIDTH} height={MARK_HEIGHT}>
        <g transform={MARK_TRANSFORM}>
          {MARK_PATHS.map(({ d, role }, i) => {
            switch (role) {
              case 'ink':
                return <path key={i} d={d} fill="#fff" />;
              case 'paper':
                return <path key={i} d={d} fill="#000" />;
              case 'tint':
                return <path key={i} d={d} fill="#fff" fillOpacity={0.2} />;
              default:
                return (
                  <path
                    key={i}
                    d={d}
                    fill="#000"
                    stroke="#fff"
                    strokeWidth={MARK_STROKE_WIDTH[role]}
                    strokeMiterlimit={10}
                  />
                );
            }
          })}
        </g>
      </mask>
      <rect width={MARK_WIDTH} height={MARK_HEIGHT} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

/* ─────────────────────────── Переключатель темы ─────────────────────────── */

export interface ThemeToggleProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * Переключатель светлой и тёмной темы.
 *
 * На сайте у переключателя три состояния (auto / light / dark) и решает их CSS
 * по атрибуту на <html>. Здесь состояний два: React знает текущую тему явно,
 * а «авто» — это вопрос загрузчика страницы, а не компонента.
 */
export function ThemeToggle({ label = 'Переключить тему', className, ...rest }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className={cx('theme-toggle', className)}
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === 'dark'}
      {...rest}
    >
      {/* display задан инлайном: правило .theme-toggle__icon скрывает иконки и
          показывает нужную по атрибуту на :root, которого в React нет. */}
      <span className="theme-toggle__icon" style={{ display: 'inline-flex' }} aria-hidden="true">
        {theme === 'dark' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}

/* ─────────────────────────── Шапка ─────────────────────────── */

export interface NavItem {
  label: ReactNode;
  href: string;
  active?: boolean;
}

export interface SiteHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Название сайта рядом со знаком. На узком экране прячется. */
  title?: ReactNode;
  logoHref?: string;
  nav?: NavItem[];
  /** Дополнительные кнопки справа. Переключатель темы добавляется сам. */
  actions?: ReactNode;
  showThemeToggle?: boolean;
  /** Липкая шапка получает границу после прокрутки — здесь задаётся вручную. */
  scrolled?: boolean;
}

/** Шапка сайта: знак, название, навигация, переключатель темы. */
export function SiteHeader({
  title = 'Мишка на сервере',
  logoHref = '/',
  nav = [],
  actions,
  showThemeToggle = true,
  scrolled = false,
  className,
  ...rest
}: SiteHeaderProps) {
  return (
    <header className={cx('header', scrolled && 'is-scrolled', className)} {...rest}>
      <div className="container header__inner">
        <a className="header__logo" href={logoHref}>
          <BearMark size={32} className="header__logo-icon" />
          <span className="header__logo-text">{title}</span>
        </a>
        <div className="header__actions">
          <nav className="header__nav">
            {nav.map((item, i) => (
              <a key={i} href={item.href} className={item.active ? 'is-active' : undefined}>
                {item.label}
              </a>
            ))}
          </nav>
          {actions}
          {showThemeToggle ? <ThemeToggle /> : null}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────── Подвал ─────────────────────────── */

export interface SocialLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: ReactNode;
  label: string;
}

export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  /** Копирайт и всё, что к нему прилегает. */
  copyright?: ReactNode;
  nav?: { heading?: ReactNode; items: NavItem[] };
  social?: { heading?: ReactNode; links: SocialLink[] };
  /** Короткий SHA сборки — инженерная деталь, подпись «собрано из коммита». */
  commit?: { sha: string; href?: string };
  powered?: ReactNode;
}

/** Подвал: копирайт, навигация, соцсети, коммит сборки. */
export function SiteFooter({ copyright, nav, social, commit, powered, className, ...rest }: SiteFooterProps) {
  return (
    <footer className={cx('footer', className)} {...rest}>
      <div className={cx('container', 'footer__inner', !nav && 'footer__inner--no-nav')}>
        <div className="footer__col">
          {copyright ? <p className="footer__copy">{copyright}</p> : null}
          {commit ? (
            <p>
              <span className="footer__commit">
                {commit.href ? (
                  <a className="footer__commit-link" href={commit.href}>
                    {commit.sha}
                  </a>
                ) : (
                  commit.sha
                )}
              </span>
            </p>
          ) : null}
          {powered ? <p className="footer__powered">{powered}</p> : null}
        </div>

        {nav ? (
          <div className="footer__col footer__nav">
            {nav.heading ? <p className="footer__heading">{nav.heading}</p> : null}
            <ul>
              {nav.items.map((item, i) => (
                <li key={i}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {social ? (
          <div className="footer__col footer__col--social footer__social">
            {social.heading ? <p className="footer__heading">{social.heading}</p> : null}
            <ul className="social-icons">
              {social.links.map(({ icon, label, ...linkProps }, i) => (
                <li key={i}>
                  <a className="social-icons__item" aria-label={label} {...linkProps}>
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
