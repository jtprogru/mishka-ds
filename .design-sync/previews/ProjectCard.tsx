import { Grid, ProjectCard } from '@jtprogru/mishka-ds';

export const Featured = () => (
  <ProjectCard
    name="srekit"
    href="#"
    lang="Go"
    status="featured"
    description="CLI для SRE-артефактов: постмортемы, runbook'и, SLO и error budget policy."
  />
);

export const Statuses = () => (
  <Grid>
    <ProjectCard name="hostsctl" href="#" lang="Rust" description="Управление /etc/hosts из терминала." />
    <ProjectCard name="old-thing" href="#" lang="Python" status="maintenance" description="Живёт, но новых фич не будет." />
    <ProjectCard name="dead-thing" href="#" lang="Perl" status="archived" description="Закрыт, оставлен для истории." />
  </Grid>
);
