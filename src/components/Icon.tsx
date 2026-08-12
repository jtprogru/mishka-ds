import type { SVGProps } from 'react';

/**
 * Иконки системы: 24×24, обводка currentColor толщиной 2, без заливки.
 * Пути перенесены один-в-один из layouts/_partials/svg.html темы —
 * набор в стиле Feather. Новые иконки добавлять сюда и в тему одновременно.
 */
export const iconPaths = {
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 16v-4M12 8h.01',
  lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74A4 4 0 0 1 9 18h6a4 4 0 0 1 1-3.26A7 7 0 0 0 12 2z',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  'alert-triangle': 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  'alert-octagon': 'M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86zM12 8v4M12 16h.01',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  copy: 'M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  check: 'M20 6 9 17l-5-5',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
} as const;

export type IconName = keyof typeof iconPaths;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Доступное имя. Без него иконка помечается декоративной. */
  title?: string;
}

export function Icon({ name, size = 20, title, className, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
