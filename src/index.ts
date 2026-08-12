/**
 * mishka-ds — дизайн-система «Мишка на сервере».
 *
 * Слои: токены (src/styles/tokens.css) → база → компоненты. React-слой не
 * содержит собственных стилей: компоненты выводят те же классы, что и
 * Go-шаблоны темы hugo-mishka, и обе стороны читают одну таблицу.
 *
 * Стили подключаются отдельно:
 *   import '@jtprogru/mishka-ds/styles.css';
 */

export { ThemeProvider, useTheme } from './components/ThemeProvider';
export type { Theme, ThemeProviderProps, ThemeContextValue } from './components/ThemeProvider';

export { Container, Prose, PageHeader, SectionTitle, Grid, Breadcrumbs } from './components/layout';
export type {
  ContainerProps,
  ProseProps,
  PageHeaderProps,
  SectionTitleProps,
  GridProps,
  BreadcrumbsProps,
  BreadcrumbItem,
} from './components/layout';

export {
  Callout,
  CodeBlock,
  InlineCode,
  Kbd,
  Collapse,
  Quote,
  ThinPlace,
  RefreshBanner,
  CtaCard,
} from './components/content';
export type {
  CalloutProps,
  CalloutType,
  CodeBlockProps,
  Highlighter,
  InlineCodeProps,
  KbdProps,
  CollapseProps,
  QuoteProps,
  ThinPlaceProps,
  RefreshBannerProps,
  CtaCardProps,
} from './components/content';

export { Tag, Badge, PostCard, ProjectCard, CompactCard } from './components/cards';
export type {
  TagProps,
  BadgeProps,
  PostCardProps,
  ProjectCardProps,
  ProjectStatus,
  CompactCardProps,
} from './components/cards';

export { Icon, iconPaths } from './components/Icon';
export type { IconProps, IconName } from './components/Icon';

export {
  Slide,
  Deck,
  SlideCover,
  SlideSection,
  SlideFact,
  SlideStatement,
  SlideQuote,
  SlideBullets,
  SlideTwoCols,
  SlideOutro,
} from './components/slides';
export type {
  SlideProps,
  SlideVariant,
  DeckProps,
  SlideCoverProps,
  SlideSectionProps,
  SlideFactProps,
  SlideStatementProps,
  SlideQuoteProps,
  SlideBulletsProps,
  SlideTwoColsProps,
  SlideOutroProps,
} from './components/slides';

export { BearMark, ThemeToggle, SiteHeader, SiteFooter } from './components/site';
export type {
  BearMarkProps,
  ThemeToggleProps,
  SiteHeaderProps,
  SiteFooterProps,
  NavItem,
  SocialLink,
} from './components/site';

export { Sheet, BusinessCard } from './components/print';
export type { SheetProps, BusinessCardProps } from './components/print';
