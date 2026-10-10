import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemePref } from './types';

const THEME_KEY = 'il-theme';

function readTheme(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* storage blocked */
  }
  return 'system';
}

export function useTheme(): [ThemePref, (t: ThemePref) => void] {
  const [theme, setTheme] = useState<ThemePref>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, setTheme];
}

export function useMediaQuery(q: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    on();
    return () => m.removeEventListener('change', on);
  }, [q]);
  return match;
}

/** 'wide' >= 1280, 'medium' 1024-1279, 'narrow' < 1024 */
export function useLayout(): 'wide' | 'medium' | 'narrow' {
  const wide = useMediaQuery('(min-width: 1280px)');
  const medium = useMediaQuery('(min-width: 1024px)');
  return wide ? 'wide' : medium ? 'medium' : 'narrow';
}

/** Screen reader announcements through one polite live region. */
export const AnnounceContext = createContext<(msg: string) => void>(() => {});
export const useAnnounce = () => useContext(AnnounceContext);

export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}
