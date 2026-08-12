import { SlideBullets } from '@jtprogru/mishka-ds';

export const Bullets = () => (
  <SlideBullets
    title="Что ломается"
    page="5"
    items={[
      'Размерность метрики теряется в отчёте',
      'Алерт срабатывает, когда бюджет уже кончился',
      'Дежурный не понимает, что означает порог',
    ]}
  />
);
