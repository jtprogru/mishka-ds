import { Tag } from '@jtprogru/mishka-ds';

export const Default = () => (
  <p style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap', margin: 0 }}>
    <Tag href="#">sre</Tag>
    <Tag href="#">kubernetes</Tag>
    <Tag href="#">observability</Tag>
  </p>
);

export const Categories = () => (
  <p style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap', margin: 0 }}>
    <Tag variant="category" href="#" color="#d20f39">SRE</Tag>
    <Tag variant="category" href="#" color="#8839ef">DevOps</Tag>
    <Tag variant="category" href="#" color="#209fb5">Процессы</Tag>
  </p>
);

export const Cloud = () => (
  <p style={{ display: 'flex', gap: 'var(--gap-sm)', flexWrap: 'wrap', margin: 0 }}>
    <Tag variant="cloud" href="#" count={42}>kubernetes</Tag>
    <Tag variant="cloud" href="#" count={14}>observability</Tag>
    <Tag variant="cloud" href="#" count={3}>postgres</Tag>
  </p>
);
