import { CodeBlock } from '@jtprogru/mishka-ds';

const yaml = `apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
spec:
  groups:
    - name: slo
      rules:
        - alert: ErrorBudgetBurn
          expr: burn_rate_1h > 14.4
          for: 2m`;

export const WithLanguage = () => <CodeBlock lang="yaml" code={yaml} />;

export const Shell = () => (
  <CodeBlock lang="bash" code={'kubectl rollout undo deploy/api -n prod\ndeployment.apps/api rolled back'} />
);

export const WithoutCopy = () => (
  <CodeBlock lang="text" copyable={false} code={'Total in 842 ms\nPages  | 126'} />
);
