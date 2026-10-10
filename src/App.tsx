import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { reducer, initialState, newScreen } from './store/state';
import { loadSession, saveBlob, saveScreens, deleteBlob, clearSession } from './store/db';
import { AnnounceContext, useMediaQuery, useTheme } from './hooks';
import { ACCEPTED, MAX_BYTES, MAX_FILES, processFile, svgToPng, uid } from './utils/image';
import { SAMPLES } from './samples/samples';
import Landing from './components/Landing';
import UploadView from './components/UploadView';
import Workspace from './components/Workspace';
import Report from './components/Report';
import { ConfirmDialog } from './components/Dialogs';
import type { ScreenMeta } from './types';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [theme, setTheme] = useTheme();
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [smallOk, setSmallOk] = useState(false);
  const small = useMediaQuery('(max-width: 767px)');
  const msgTimer = useRef<number | undefined>(undefined);

  const announce = useCallback((m: string) => {
    window.clearTimeout(msgTimer.current);
    setMessage('');
    // Short delay so repeated messages are read again
    msgTimer.current = window.setTimeout(() => setMessage(m), 60);
  }, []);

  useEffect(() => {
    loadSession().then(({ screens, blobs }) => {
      const urls: Record<string, string> = {};
      for (const [id, b] of Object.entries(blobs)) urls[id] = URL.createObjectURL(b);
      dispatch({ type: 'loaded', screens, urls });
    });
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    const t = window.setTimeout(() => saveScreens(state.screens), 250);
    return () => window.clearTimeout(t);
  }, [state.screens, state.loaded]);

  useEffect(() => {
    const titles = { landing: 'Inclusive Layout', upload: 'Add screens · Inclusive Layout', review: 'Review · Inclusive Layout', report: 'Report · Inclusive Layout' };
    document.title = titles[state.view];
    window.scrollTo(0, 0);
  }, [state.view]);

  /** Add files and return human readable errors for the ones that were skipped. */
  const addFiles = useCallback(
    async (files: File[]): Promise<string[]> => {
      const errors: string[] = [];
      const room = MAX_FILES - state.screens.length;
      if (room <= 0) return [`You can review up to ${MAX_FILES} screens at a time. Remove one to add more.`];
      if (files.length > room) errors.push(`Only ${room} more screen${room === 1 ? '' : 's'} fit. ${files.length - room} were skipped.`);
      const added: ScreenMeta[] = [];
      const urls: Record<string, string> = {};
      for (const f of files.slice(0, room)) {
        if (!ACCEPTED.includes(f.type)) {
          errors.push(`${f.name}: use a PNG, JPG or WebP image.`);
          continue;
        }
        if (f.size > MAX_BYTES) {
          errors.push(`${f.name}: larger than 10 MB.`);
          continue;
        }
        try {
          const p = await processFile(f);
          const id = uid();
          await saveBlob(id, p.blob);
          urls[id] = URL.createObjectURL(p.blob);
          const name = f.name.replace(/\.[a-z0-9]+$/i, '') || 'Screen';
          added.push(newScreen(id, name, p.width, p.height, p.scale));
        } catch {
          errors.push(`${f.name}: could not be read.`);
        }
      }
      if (added.length) {
        dispatch({ type: 'add', screens: added, urls });
        announce(`${added.length} screen${added.length === 1 ? '' : 's'} added.`);
      }
      return errors;
    },
    [state.screens.length, announce],
  );

  const addSamples = useCallback(async () => {
    const added: ScreenMeta[] = [];
    const urls: Record<string, string> = {};
    const room = MAX_FILES - state.screens.length;
    for (const s of SAMPLES.slice(0, Math.max(0, room))) {
      const p = await svgToPng(s.svg, 780);
      const id = uid();
      await saveBlob(id, p.blob);
      urls[id] = URL.createObjectURL(p.blob);
      added.push(newScreen(id, s.name, p.width, p.height, 2));
    }
    dispatch({ type: 'add', screens: added, urls });
    announce(`${added.length} sample screens added.`);
    return added.length;
  }, [state.screens.length, announce]);

  const removeScreen = useCallback(
    (id: string) => {
      const s = state.screens.find((x) => x.id === id);
      deleteBlob(id);
      dispatch({ type: 'remove', id });
      if (s) announce(`${s.name} removed.`);
    },
    [state.screens, announce],
  );

  const doClear = async () => {
    await clearSession();
    dispatch({ type: 'clear' });
    setConfirmClear(false);
    announce('Session cleared. All screens and notes were deleted from this browser.');
  };

  const common = { theme, setTheme, onClear: () => setConfirmClear(true) };

  return (
    <AnnounceContext.Provider value={announce}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {small && !smallOk && state.view !== 'landing' ? (
        <div className="small-screen" role="dialog" aria-labelledby="small-title">
          <h1 id="small-title">Best on a tablet or computer</h1>
          <p>Inclusive Layout needs room for the screenshot, the lenses and your notes. Open it on a screen at least 768 px wide for the full experience.</p>
          <button className="btn btn-primary" onClick={() => setSmallOk(true)}>
            Continue anyway
          </button>
        </div>
      ) : null}

      {state.view === 'landing' && (
        <Landing
          {...common}
          loaded={state.loaded}
          screenCount={state.screens.length}
          onStart={() => dispatch({ type: 'view', view: state.screens.length ? 'review' : 'upload' })}
          onNew={() => dispatch({ type: 'view', view: 'upload' })}
          onSamples={async () => {
            if (state.screens.length === 0) await addSamples();
            dispatch({ type: 'view', view: 'review' });
          }}
        />
      )}
      {state.view === 'upload' && (
        <UploadView
          {...common}
          screens={state.screens}
          urls={state.urls}
          onAdd={addFiles}
          onSamples={addSamples}
          onRemove={removeScreen}
          onHome={() => dispatch({ type: 'view', view: 'landing' })}
          onStart={() => dispatch({ type: 'view', view: 'review' })}
        />
      )}
      {state.view === 'review' && (
        <Workspace
          {...common}
          state={state}
          dispatch={dispatch}
          onAdd={addFiles}
          onRemove={removeScreen}
          onHome={() => dispatch({ type: 'view', view: 'landing' })}
          onReport={() => dispatch({ type: 'view', view: 'report' })}
          onUploadView={() => dispatch({ type: 'view', view: 'upload' })}
        />
      )}
      {state.view === 'report' && (
        <Report screens={state.screens} urls={state.urls} onBack={() => dispatch({ type: 'view', view: 'review' })} />
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear this session?"
        body="All screens, pins and notes will be deleted from this browser. This cannot be undone."
        confirm="Clear session"
        danger
        onConfirm={doClear}
        onCancel={() => setConfirmClear(false)}
      />
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}
