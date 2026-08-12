import { SiteHeader } from '@jtprogru/mishka-ds';

export const Default = () => (
  <SiteHeader
    nav={[
      { label: 'Записи', href: '#', active: true },
      { label: 'Проекты', href: '#' },
      { label: 'Об авторе', href: '#' },
    ]}
  />
);

export const Scrolled = () => (
  <SiteHeader
    scrolled
    title="savinmi.ru"
    nav={[
      { label: 'Опыт', href: '#' },
      { label: 'Навыки', href: '#' },
      { label: 'Контакты', href: '#', active: true },
    ]}
  />
);
