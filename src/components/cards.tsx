import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/* ============================ Пилюли ============================ */

export interface TagProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * default — тег на карточке, category — цветная пилюля рубрики,
   * cloud — крупная пилюля для облака тегов со счётчиком.
   */
  variant?: 'default' | 'category' | 'cloud';
  /** Цвет пилюли категории. Уходит в --tag-bg, как в data/category-colors.yaml. */
  color?: string;
  /** Счётчик — только для варианта cloud. */
  count?: number;
  children?: ReactNode;
}

export function Tag({ variant = 'default', color, count, className, style, children, ...rest }: TagProps) {
  const isCategory = variant === 'category' || (variant === 'cloud' && color !== undefined);
  return (
    <a
      className={cx('tag', variant === 'cloud' && 'tag--cloud', isCategory && 'tag--cat', className)}
      style={color ? { ...style, ['--tag-bg' as string]: color } : style}
      {...rest}
    >
      {children}
      {variant === 'cloud' && count !== undefined ? <span className="tag__count">{count}</span> : null}
    </a>
  );
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pinned';
  children?: ReactNode;
}

/** Маленький маркер: закреплённый пост, счётчик, статус. */
export function Badge({ variant = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('badge', variant === 'pinned' && 'badge--pinned', className)} {...rest}>
      {children}
    </span>
  );
}

/* ============================ Карточка поста ============================ */

export interface PostCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  href: string;
  /** Готовая к показу строка даты. Формат — забота вызывающего кода. */
  date?: ReactNode;
  excerpt?: ReactNode;
  cover?: { src: string; alt?: string };
  categories?: Array<{ label: ReactNode; href: string; color?: string }>;
  /** Закреплённый пост получает акцентную полоску слева. */
  pinned?: boolean;
}

/**
 * Карточка поста для списков. Кликается целиком: ссылка заголовка растянута
 * на всю карточку, вложенные ссылки категорий лежат поверх неё.
 */
export function PostCard({
  title,
  href,
  date,
  excerpt,
  cover,
  categories,
  pinned = false,
  className,
  ...rest
}: PostCardProps) {
  return (
    <article className={cx('post-card', pinned && 'post-card--pinned', className)} {...rest}>
      {cover ? (
        <a className="post-card__cover-wrap" href={href} tabIndex={-1} aria-hidden="true">
          <img className="post-card__cover" src={cover.src} alt={cover.alt ?? ''} loading="lazy" />
        </a>
      ) : null}
      <div className="post-card__body">
        <h2 className="post-card__title">
          <a href={href}>{title}</a>
        </h2>
        {date ? <p className="post-card__meta">{date}</p> : null}
        {excerpt ? <p className="post-card__excerpt">{excerpt}</p> : null}
        {categories?.length ? (
          <ul className="post-card__cats">
            {categories.map((cat, i) => (
              <li key={i}>
                <Tag variant="category" href={cat.href} color={cat.color}>
                  {cat.label}
                </Tag>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

/* ============================ Карточка проекта ============================ */

export type ProjectStatus = 'featured' | 'maintenance' | 'archived' | 'active';

const statusLabels: Record<Exclude<ProjectStatus, 'active'>, string> = {
  featured: 'featured',
  maintenance: 'maintenance',
  archived: 'archived',
};

export interface ProjectCardProps extends Omit<HTMLAttributes<HTMLElement>, 'lang'> {
  name: ReactNode;
  href: string;
  description?: ReactNode;
  /** Язык или стек — пилюля справа от имени. */
  lang?: ReactNode;
  status?: ProjectStatus;
  /** Своя подпись статуса вместо стандартной. */
  statusLabel?: ReactNode;
}

/** Карточка проекта: имя моноширинным, описание, язык, статус. */
export function ProjectCard({
  name,
  href,
  description,
  lang,
  status = 'active',
  statusLabel,
  className,
  ...rest
}: ProjectCardProps) {
  const decorated = status !== 'active';
  return (
    <article
      className={cx(
        'proj-card',
        status === 'featured' && 'proj-card--featured',
        status === 'archived' && 'proj-card--archived',
        className,
      )}
      {...rest}
    >
      <div className="proj-card__head">
        <h3 className="proj-card__name">{name}</h3>
        {lang ? <span className="proj-card__lang">{lang}</span> : null}
      </div>
      {description ? <p className="proj-card__desc">{description}</p> : null}
      {decorated ? (
        <div className="proj-card__foot">
          <span className={cx('proj-card__badge', `proj-card__badge--${status}`)}>
            {statusLabel ?? statusLabels[status]}
          </span>
        </div>
      ) : null}
      <a className="proj-card__link" href={href} aria-label={typeof name === 'string' ? name : undefined} />
    </article>
  );
}

/* ============================ Компактная карточка ============================ */

export interface CompactCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  href: string;
  meta?: ReactNode;
  cover?: { src: string; alt?: string };
}

/** Плотная карточка со скруглённой миниатюрой — сетка «свежее» на главной. */
export function CompactCard({ title, href, meta, cover, className, ...rest }: CompactCardProps) {
  return (
    <article className={cx('lp-card', className)} {...rest}>
      {cover ? <img className="lp-card__cover" src={cover.src} alt={cover.alt ?? ''} loading="lazy" /> : null}
      <div className="lp-card__meta">
        <h3 className="lp-card__title">{title}</h3>
        {meta ? <span className="lp-card__date">{meta}</span> : null}
      </div>
      <a className="lp-card__link" href={href} aria-label={typeof title === 'string' ? title : undefined} />
    </article>
  );
}
