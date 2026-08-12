import { Quote } from '@jtprogru/mishka-ds';

export const WithSource = () => (
  <Quote cite="из постмортема INC-482">
    <p>Митигируй раньше, чем чинишь. Root cause подождёт, пользователи — нет.</p>
  </Quote>
);

export const Plain = () => (
  <Quote>
    <p>Надёжность измеряется не аптаймом, а тем, сколько раз пользователь не заметил отказа.</p>
  </Quote>
);
