import { CodeBlock, Collapse } from '@jtprogru/mishka-ds';

export const Closed = () => (
  <Collapse summary="Полный вывод kubectl describe">
    <CodeBlock
      lang="text"
      copyable={false}
      code={'Events:\n  Warning  BackOff  2m (x12 over 8m)  kubelet  Back-off restarting failed container'}
    />
  </Collapse>
);

export const Open = () => (
  <Collapse defaultOpen summary="Почему окно именно час">
    <p>
      Короче — ловим шум деплоя. Длиннее — узнаём об утечке бюджета, когда он уже кончился.
    </p>
  </Collapse>
);
