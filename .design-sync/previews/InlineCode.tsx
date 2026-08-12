import { InlineCode, Prose } from '@jtprogru/mishka-ds';

export const InProse = () => (
  <Prose>
    <p>
      Проверить статус подов: <InlineCode>kubectl get pods -n prod</InlineCode>. Если под в{' '}
      <InlineCode>CrashLoopBackOff</InlineCode>, смотреть <InlineCode>kubectl logs --previous</InlineCode>.
    </p>
  </Prose>
);
