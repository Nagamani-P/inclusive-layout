import { AlertTriangle, CheckCircle2, Circle, CircleDot, Diamond, Info, Monitor, Moon, Sun, Triangle } from 'lucide-react';
import type { ScreenStatus, Severity, ThemePref } from '../types';

export function Logo() {
  return (
    <span className="logo">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect x="1" y="1" width="26" height="26" rx="7" fill="var(--accent)" />
        <rect x="6" y="7" width="7" height="14" rx="2" fill="var(--accent-ink)" />
        <rect x="15" y="7" width="7" height="6" rx="2" fill="var(--accent-ink)" />
        <circle cx="18.5" cy="18" r="3.2" fill="none" stroke="var(--accent-ink)" strokeWidth="2" />
      </svg>
      <span className="logo-text">Inclusive Layout</span>
    </span>
  );
}

export function ThemeSwitch({ theme, setTheme }: { theme: ThemePref; setTheme: (t: ThemePref) => void }) {
  const opts: { id: ThemePref; label: string; Icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', Icon: Sun },
    { id: 'dark', label: 'Dark', Icon: Moon },
    { id: 'system', label: 'System', Icon: Monitor },
  ];
  return (
    <div className="segmented" role="radiogroup" aria-label="Color theme">
      {opts.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={theme === id}
          className="segmented-item"
          onClick={() => setTheme(id)}
          title={`${label} theme`}
        >
          <Icon size={16} aria-hidden="true" />
          <span className="segmented-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

export const SEVERITY_LABEL: Record<Severity, string> = { high: 'High', medium: 'Medium', low: 'Low' };

/** Severity shape: triangle, diamond, circle. Shape and text always accompany color. */
export function SeverityIcon({ severity, size = 14 }: { severity: Severity; size?: number }) {
  const Icon = severity === 'high' ? Triangle : severity === 'medium' ? Diamond : Circle;
  return <Icon size={size} aria-hidden="true" fill="currentColor" strokeWidth={2} />;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`badge sev-${severity}`}>
      <SeverityIcon severity={severity} size={12} />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export const STATUS_LABEL: Record<ScreenStatus, string> = {
  'not-reviewed': 'Not reviewed',
  'in-review': 'In review',
  done: 'Done',
};

export function StatusBadge({ status, compact }: { status: ScreenStatus; compact?: boolean }) {
  const Icon = status === 'done' ? CheckCircle2 : status === 'in-review' ? CircleDot : Circle;
  return (
    <span className={`badge status-${status}${compact ? ' badge-compact' : ''}`}>
      <Icon size={12} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** The pin glyph drawn on the screenshot. */
export function PinGlyph({ severity, n }: { severity: Severity; n: number }) {
  return (
    <svg className={`pin-glyph sev-${severity}`} width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      {severity === 'high' && <path d="M15 2 L28.5 26.5 H1.5 Z" className="pin-shape" />}
      {severity === 'medium' && <path d="M15 1.5 L28.5 15 L15 28.5 L1.5 15 Z" className="pin-shape" />}
      {severity === 'low' && <circle cx="15" cy="15" r="13" className="pin-shape" />}
      <text x="15" y={severity === 'high' ? 22 : 19.5} textAnchor="middle" className="pin-num">
        {n}
      </text>
    </svg>
  );
}

export function Note({ kind = 'info', children }: { kind?: 'info' | 'warn'; children: React.ReactNode }) {
  const Icon = kind === 'warn' ? AlertTriangle : Info;
  return (
    <p className={`note note-${kind}`}>
      <Icon size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
