import { CtaCard, Icon } from '@jtprogru/mishka-ds';

export const Telegram = () => (
  <CtaCard
    icon={<Icon name="send" size={20} />}
    title="Канал «Мишка на сервере»"
    text="Короткие заметки между постами: разборы инцидентов, находки, ворчание."
    actionLabel="Подписаться"
    href="#"
  />
);

export const Repo = () => (
  <CtaCard
    icon={<Icon name="link" size={20} />}
    title="Исходники к посту"
    text="Манифесты, правила алертов и скрипт проверки — в репозитории."
    actionLabel="Открыть"
    href="#"
  />
);
