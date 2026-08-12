import { Callout, ThemeProvider } from '@jtprogru/mishka-ds';

export const BothThemes = () => (
  <div style={{ display: 'grid', gap: 'var(--gap-md)' }}>
    <ThemeProvider mode="scoped" theme="light">
      <div style={{ padding: 'var(--gap-md)', borderRadius: 'var(--radius-md)' }}>
        <Callout type="note" title="Светлая тема">
          <p>Токены переключаются на любом узле, а не только на корне документа.</p>
        </Callout>
      </div>
    </ThemeProvider>
    <ThemeProvider mode="scoped" theme="dark">
      <div style={{ padding: 'var(--gap-md)', borderRadius: 'var(--radius-md)' }}>
        <Callout type="note" title="Тёмная тема">
          <p>Тот же компонент, те же классы — переключился только слой значений.</p>
        </Callout>
      </div>
    </ThemeProvider>
  </div>
);
