import { Deck, SlideCover, SlideFact, SlideOutro, SlideSection } from '@jtprogru/mishka-ds';

export const Storyboard = () => (
  <Deck layout="storyboard">
    <SlideCover title="Burn-rate — что тут не так" subtitle="SRE-митап · 20 минут" />
    <SlideSection kicker="акт первый" title="Как было устроено" page="4" />
    <SlideFact value="14.4×" caption="порог, за которым бюджет горит слишком быстро" page="7" />
    <SlideOutro title="Куда дальше" links={['jtprog.ru/burn-rate', 't.me/jtprogru']} page="18" />
  </Deck>
);
