import type { HTMLAttributes, ReactNode } from 'react';
import { BearMark } from './site';

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

export interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Лист A4 с настоящими полями — резюме, одностраничник, раздатка.
 *
 * На экране показывается как лист с тенью, при печати превращается в саму
 * страницу: поля берёт @page, тень убирает. Несколько Sheet подряд печатаются
 * каждый со своей страницы.
 */
export function Sheet({ className, children, ...rest }: SheetProps) {
  return (
    <div className={cx('sheet', className)} {...rest}>
      {children}
    </div>
  );
}

export interface BusinessCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** front — тёмное лицо со знаком и именем; back — светлый оборот с контактами. */
  side?: 'front' | 'back';
  name?: ReactNode;
  role?: ReactNode;
  contacts?: ReactNode[];
  /** Показать пунктир безопасного поля. Только на экране, в печать не идёт. */
  guides?: boolean;
  children?: ReactNode;
}

/**
 * Визитка 90×50 мм. Компонент рисует размер с вылетами — 96×56, по 3 мм с
 * каждой стороны: типография режет стопку разом, и без вылетов на краю
 * появляется белая полоска.
 *
 * Формат страницы компонент не объявляет: `@page` глобален, и визиточный
 * размер сломал бы печать резюме на A4. Печатать из отдельного документа,
 * который объявляет у себя `@page { size: 96mm 56mm; margin: 0 }`.
 */
export function BusinessCard({
  side = 'front',
  name,
  role,
  contacts,
  guides = false,
  className,
  children,
  ...rest
}: BusinessCardProps) {
  const isFront = side === 'front';
  return (
    <div
      className={cx('card', side === 'back' && 'card--back', guides && 'card--guides', className)}
      {...rest}
    >
      {isFront ? (
        <>
          <BearMark size={38} />
          <div>
            {name ? <p className="card__name">{name}</p> : null}
            {role ? <p className="card__role">{role}</p> : null}
            <div className="card__rule" style={{ marginTop: '2mm' }} />
          </div>
        </>
      ) : (
        <>
          <div className="card__rule" />
          {contacts?.length ? (
            <ul className="card__contacts">
              {contacts.map((contact, i) => (
                <li key={i}>{contact}</li>
              ))}
            </ul>
          ) : null}
        </>
      )}
      {children}
    </div>
  );
}
