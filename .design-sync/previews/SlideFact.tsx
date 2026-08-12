import { SlideFact } from '@jtprogru/mishka-ds';

export const Fact = () => (
  <SlideFact value="14.4×" caption="скорость сгорания, при которой месячный бюджет кончится за двое суток" page="7" />
);

export const Metric = () => (
  <SlideFact as="metric" value="43 минуты" caption="весь бюджет ошибок на месяц при SLO 99.9%" page="8" />
);
