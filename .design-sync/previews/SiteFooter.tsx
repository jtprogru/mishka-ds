import { Icon, SiteFooter } from '@jtprogru/mishka-ds';

export const Full = () => (
  <SiteFooter
    copyright="© 2026 Михаил Савин. Тексты — CC BY-NC-SA 4.0, код — MIT."
    commit={{ sha: '2673c50', href: '#' }}
    powered="Собрано Hugo и темой mishka"
    nav={{
      heading: 'Разделы',
      items: [
        { label: 'Архив', href: '#' },
        { label: 'Теги', href: '#' },
        { label: 'RSS', href: '#' },
      ],
    }}
    social={{
      heading: 'Связь',
      links: [
        { icon: <Icon name="send" size={20} />, label: 'Telegram', href: '#' },
        { icon: <Icon name="link" size={20} />, label: 'GitHub', href: '#' },
        { icon: <Icon name="check" size={20} />, label: 'Почта', href: '#' },
      ],
    }}
  />
);

export const Minimal = () => (
  <SiteFooter copyright="© 2026 Михаил Савин" commit={{ sha: 'a1b2c3d' }} />
);
