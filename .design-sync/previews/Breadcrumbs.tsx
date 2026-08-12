import { Breadcrumbs } from '@jtprogru/mishka-ds';

export const Post = () => (
  <Breadcrumbs
    items={[
      { label: 'Главная', href: '#' },
      { label: 'Записи', href: '#' },
      { label: 'Burn-rate — что тут не так' },
    ]}
  />
);

export const Section = () => (
  <Breadcrumbs items={[{ label: 'Главная', href: '#' }, { label: 'Проекты' }]} />
);
