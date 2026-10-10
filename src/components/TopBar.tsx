import type { ReactNode } from 'react';
import { Logo, ThemeSwitch } from './ui';
import type { ThemePref } from '../types';

export default function TopBar({
  theme,
  setTheme,
  onHome,
  center,
  actions,
}: {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  onHome: () => void;
  center?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="topbar">
      <button className="logo-btn" onClick={onHome} aria-label="Inclusive Layout home">
        <Logo />
      </button>
      <div className="topbar-center">{center}</div>
      <div className="topbar-actions">
        {actions}
        <ThemeSwitch theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
}
