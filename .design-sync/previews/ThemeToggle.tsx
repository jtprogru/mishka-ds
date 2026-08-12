import { ThemeToggle } from '@jtprogru/mishka-ds';

export const Default = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--gap-sm)', color: 'var(--fg-muted)' }}>
    <ThemeToggle />
    <span style={{ fontSize: 'var(--fs-sm)' }}>переключатель темы</span>
  </span>
);
