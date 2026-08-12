import { Callout } from '@jtprogru/mishka-ds';

export const Note = () => (
  <Callout type="note" title="Как это читать">
    <p>
      Метрика считается за скользящее окно в один час. Если окно короче, всплеск на деплое
      выглядит как деградация.
    </p>
  </Callout>
);

export const Tip = () => (
  <Callout type="tip" title="Совет">
    <p>
      Порог по скорости сгорания ловит и всплеск, и медленную утечку. Порог по абсолютному числу
      ошибок — только всплеск.
    </p>
  </Callout>
);

export const Important = () => (
  <Callout type="important" title="Не пропустить">
    <p>
      Бюджет ошибок считается от SLO, а не от отчёта за прошлый месяц. Если цифры расходятся,
      расходятся источники данных.
    </p>
  </Callout>
);

export const Warn = () => (
  <Callout type="warn" title="Осторожно">
    <p>
      Смена окна алерта задним числом переписывает историю срабатываний — постмортемы за прошлый
      квартал перестанут сходиться.
    </p>
  </Callout>
);

export const Danger = () => (
  <Callout type="danger" title="Можно сломать прод">
    <p>
      <code>kubectl delete pvc</code> не спрашивает подтверждения и не смотрит на reclaim policy.
    </p>
  </Callout>
);
