import { SlideSection } from '@jtprogru/mishka-ds';

export const Section = () => (
  <SlideSection kicker="акт первый" title="Как было устроено" page="4" />
);

export const WithSubtitle = () => (
  <SlideSection
    kicker="акт второй"
    title="Где это ломается"
    subtitle="Три места, где метрика врёт дежурному"
    page="11"
  />
);
