import { SlideTwoCols } from '@jtprogru/mishka-ds';

export const BeforeAfter = () => (
  <SlideTwoCols
    title="Было и стало"
    page="10"
    left={
      <>
        <p style={{ fontWeight: 700 }}>Было</p>
        <p>Порог на абсолютном числе ошибок. Срабатывает на всплеске деплоя и молчит на медленной утечке.</p>
      </>
    }
    right={
      <>
        <p style={{ fontWeight: 700 }}>Стало</p>
        <p>Порог на скорости сгорания. Одинаково ловит и всплеск, и утечку — потому что считает не события, а бюджет.</p>
      </>
    }
  />
);
