import { PostCard } from '@jtprogru/mishka-ds';

export const Default = () => (
  <PostCard
    title="Burn-rate — что тут не так"
    href="#"
    date="14 марта 2026 · 9 минут"
    excerpt="Скорость сгорания бюджета ошибок — не скорость. Разбираем размерность и почему 14.4× это не «в 14 раз быстрее»."
    categories={[{ label: 'SRE', href: '#', color: '#d20f39' }]}
  />
);

export const Pinned = () => (
  <PostCard
    pinned
    title="Зрелость DIS без религии"
    href="#"
    date="2 февраля 2026 · 12 минут"
    excerpt="Модель зрелости полезна ровно до того момента, когда её начинают защищать вместо того, чтобы применять."
    categories={[
      { label: 'DevOps', href: '#', color: '#8839ef' },
      { label: 'Процессы', href: '#', color: '#209fb5' },
    ]}
  />
);

export const WithoutExcerpt = () => (
  <PostCard title="IndexNow за один вечер" href="#" date="11 декабря 2025 · 6 минут" />
);
