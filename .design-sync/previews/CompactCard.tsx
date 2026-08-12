import { CompactCard, Grid } from '@jtprogru/mishka-ds';

export const Default = () => (
  <CompactCard title="Как я перестал бояться и полюбил error budget" href="#" meta="20 января 2026" />
);

export const Grid2 = () => (
  <Grid variant="two">
    <CompactCard title="IndexNow за один вечер" href="#" meta="11 декабря 2025" />
    <CompactCard title="Мишка переезжает на catppuccin" href="#" meta="3 ноября 2025" />
  </Grid>
);
