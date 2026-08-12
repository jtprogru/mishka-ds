import { Grid, ProjectCard } from '@jtprogru/mishka-ds';

export const AutoFit = () => (
  <Grid>
    <ProjectCard name="srekit" href="#" lang="Go" description="SRE-артефакты из CLI." />
    <ProjectCard name="hostsctl" href="#" lang="Rust" description="Управление /etc/hosts." />
    <ProjectCard name="mishka-ds" href="#" lang="CSS" description="Эта дизайн-система." />
  </Grid>
);

export const TwoColumns = () => (
  <Grid variant="two">
    <ProjectCard name="jtprog.ru" href="#" lang="Hugo" description="Блог." />
    <ProjectCard name="savinmi.ru" href="#" lang="Astro" description="Резюме." />
  </Grid>
);
