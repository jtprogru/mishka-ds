import { SectionTitle, Sheet } from '@jtprogru/mishka-ds';

export const Resume = () => (
  <Sheet>
    <h1 style={{ margin: 0, fontSize: 'var(--print-fs-title)' }}>Михаил Савин</h1>
    <p style={{ margin: '2mm 0 0', color: 'var(--fg-muted)' }}>
      SRE · Москва · jtprog.ru · t.me/jtprogru
    </p>
    <SectionTitle as="h2">Опыт</SectionTitle>
    <p style={{ margin: 0, fontWeight: 700 }}>Ведущий SRE — 2022 по настоящее время</p>
    <p style={{ margin: '1mm 0 0', color: 'var(--fg-muted)' }}>
      Error budget policy на 40 сервисов, миграция алертов на burn-rate, дежурства без героизма.
    </p>
    <SectionTitle as="h2">Навыки</SectionTitle>
    <p style={{ margin: 0, color: 'var(--fg-muted)' }}>
      Kubernetes, Prometheus, Go, Terraform, PostgreSQL, инцидент-менеджмент.
    </p>
  </Sheet>
);
