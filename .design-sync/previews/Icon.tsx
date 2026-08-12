import { Icon, iconPaths, type IconName } from '@jtprogru/mishka-ds';

const names = Object.keys(iconPaths) as IconName[];

export const AllIcons = () => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', color: 'var(--fg)' }}>
    {names.map((name) => (
      <span
        key={name}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--gap-xs)',
          fontSize: 'var(--fs-xs)',
          color: 'var(--fg-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <Icon name={name} size={24} />
        {name}
      </span>
    ))}
  </div>
);

export const Accent = () => (
  <span style={{ color: 'var(--accent)', display: 'inline-flex', gap: 'var(--gap-sm)' }}>
    <Icon name="check" size={28} />
    <Icon name="star" size={28} />
    <Icon name="arrow-right" size={28} />
  </span>
);
