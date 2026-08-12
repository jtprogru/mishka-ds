import { RefreshBanner } from '@jtprogru/mishka-ds';

export const Default = () => (
  <RefreshBanner>
    Пост обновлён в апреле 2026: команды приведены к Hugo 0.140, ссылка на устаревший плагин убрана.
  </RefreshBanner>
);

export const CustomLabel = () => (
  <RefreshBanner label="архив">Материал 2021 года, оставлен как есть.</RefreshBanner>
);
