import { PageHeader } from '@jtprogru/mishka-ds';

export const Post = () => (
  <PageHeader
    kicker="SRE"
    title="Burn-rate — что тут не так"
    lede="Скорость сгорания бюджета ошибок звучит как скорость, ведёт себя как множитель и ломается ровно там, где её принимают за первое."
    meta="14 марта 2026 · 9 минут чтения · обновлено 2 апреля"
  />
);

export const Section = () => (
  <PageHeader
    kicker="Раздел"
    title="Записи"
    lede="Эссе про надёжность и разборы «как что устроено»."
    meta="126 постов"
  />
);

export const TitleOnly = () => <PageHeader title="Архив" />;
