import type { ScreenMeta, View } from '../types';

export interface AppState {
  loaded: boolean;
  view: View;
  screens: ScreenMeta[];
  urls: Record<string, string>;
  activeId: string | null;
}

export type Action =
  | { type: 'loaded'; screens: ScreenMeta[]; urls: Record<string, string> }
  | { type: 'view'; view: View }
  | { type: 'add'; screens: ScreenMeta[]; urls: Record<string, string> }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; to: number }
  | { type: 'active'; id: string }
  | { type: 'update'; id: string; fn: (s: ScreenMeta) => ScreenMeta }
  | { type: 'clear' };

export const initialState: AppState = { loaded: false, view: 'landing', screens: [], urls: {}, activeId: null };

/** Opening a screen moves it from Not reviewed to In review. */
function touch(screens: ScreenMeta[], id: string | null) {
  return screens.map((s) => (s.id === id && s.status === 'not-reviewed' ? { ...s, status: 'in-review' as const } : s));
}

export function reducer(state: AppState, a: Action): AppState {
  switch (a.type) {
    case 'loaded':
      return { ...state, loaded: true, screens: a.screens, urls: a.urls, activeId: a.screens[0]?.id ?? null };
    case 'view':
      if (a.view === 'review') {
        const activeId = state.activeId ?? state.screens[0]?.id ?? null;
        return { ...state, view: a.view, activeId, screens: touch(state.screens, activeId) };
      }
      return { ...state, view: a.view };
    case 'add':
      return {
        ...state,
        screens: [...state.screens, ...a.screens],
        urls: { ...state.urls, ...a.urls },
        activeId: state.activeId ?? a.screens[0]?.id ?? null,
      };
    case 'remove': {
      const idx = state.screens.findIndex((s) => s.id === a.id);
      const screens = state.screens.filter((s) => s.id !== a.id);
      const urls = { ...state.urls };
      if (urls[a.id]) URL.revokeObjectURL(urls[a.id]);
      delete urls[a.id];
      let activeId = state.activeId;
      if (activeId === a.id) activeId = screens[Math.min(idx, screens.length - 1)]?.id ?? null;
      return { ...state, screens: touch(screens, state.view === 'review' ? activeId : null), urls, activeId };
    }
    case 'move': {
      const from = state.screens.findIndex((s) => s.id === a.id);
      if (from < 0) return state;
      const to = Math.max(0, Math.min(state.screens.length - 1, a.to));
      const screens = [...state.screens];
      const [item] = screens.splice(from, 1);
      screens.splice(to, 0, item);
      return { ...state, screens };
    }
    case 'active':
      return { ...state, activeId: a.id, screens: touch(state.screens, a.id) };
    case 'update':
      return { ...state, screens: state.screens.map((s) => (s.id === a.id ? a.fn(s) : s)) };
    case 'clear':
      Object.values(state.urls).forEach((u) => URL.revokeObjectURL(u));
      return { ...state, screens: [], urls: {}, activeId: null, view: 'landing' };
  }
}

export function newScreen(id: string, name: string, width: number, height: number, scale: number): ScreenMeta {
  return { id, name, width, height, scale, status: 'not-reviewed', issues: [], measures: [], checklist: {}, createdAt: Date.now() };
}
