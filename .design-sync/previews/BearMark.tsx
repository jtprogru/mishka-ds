import { BearMark } from '@jtprogru/mishka-ds';

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--gap-lg)', color: 'var(--fg)' }}>
    <BearMark size={16} />
    <BearMark size={32} />
    <BearMark size={64} />
  </div>
);

export const OnAccent = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--gap-sm)',
      padding: 'var(--gap-md)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-elev)',
      color: 'var(--accent)',
    }}
  >
    <BearMark size={40} />
    <span style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Мишка на сервере</span>
  </div>
);
