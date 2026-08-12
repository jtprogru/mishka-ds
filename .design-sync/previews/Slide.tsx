import { CodeBlock, Slide } from '@jtprogru/mishka-ds';

export const Default = () => (
  <Slide page="6" footer="Burn-rate — что тут не так">
    <h2 className="slide__title">Правило порога</h2>
    <p>
      Алерт срабатывает, когда за час сгорает больше 14.4× нормы. Это не «в 14 раз быстрее» —
      это множитель к равномерному расходу.
    </p>
    <CodeBlock lang="promql" copyable={false} code={'burn_rate_1h > 14.4\nand\nburn_rate_5m > 14.4'} />
  </Slide>
);

export const Intro = () => (
  <Slide variant="intro" page="2">
    <h2 className="slide__title">Кто я</h2>
    <p className="slide__lede">SRE, десять лет дежурю. Веду блог «Мишка на сервере».</p>
  </Slide>
);
