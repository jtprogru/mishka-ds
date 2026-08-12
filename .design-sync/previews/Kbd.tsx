import { Kbd, Prose } from '@jtprogru/mishka-ds';

export const Combo = () => (
  <Prose>
    <p>
      Палитра команд — <Kbd keys="Cmd+Shift+P" />, режим чтения — <Kbd keys={['f']} />, выйти из
      vim — <Kbd keys={[':', 'q', '!']} separator="" />.
    </p>
  </Prose>
);

export const Single = () => <Kbd keys={['Esc']} />;
