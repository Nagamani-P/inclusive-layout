import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Dispatch } from 'react';
import {
  Columns2,
  Ear,
  Eye,
  FileDown,
  Hand,
  HelpCircle,
  Info,
  Keyboard,
  ListChecks,
  MapPin,
  Maximize,
  MousePointer2,
  Pipette,
  Ruler,
  SplitSquareHorizontal,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import TopBar from './TopBar';
import Stage, { type Layers } from './Stage';
import LensPanel from './LensPanel';
import FindingsPanel from './FindingsPanel';
import Filmstrip from './Filmstrip';
import IssueDialog, { draftFrom, type IssueDraft } from './IssueDialog';
import { AboutDialog, ConfirmDialog, RenameDialog, ShortcutsDialog } from './Dialogs';
import { SvgFilters, lensVisual } from '../lenses/filters';
import { lensById } from '../lenses/defs';
import { isTypingTarget, useAnnounce, useLayout } from '../hooks';
import { getPixelContext, uid, ACCEPTED } from '../utils/image';
import { rgbToHex } from '../utils/contrast';
import { ABILITY_LABEL } from '../data/tips';
import { SEVERITY_LABEL } from './ui';
import type { Action, AppState } from '../store/state';
import type { Ability, CheckState, CompareMode, Hand as HandT, Issue, LensId, Measure, Mode, ScreenMeta, ThemePref, VisionLensId } from '../types';

interface Props {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  onClear: () => void;
  state: AppState;
  dispatch: Dispatch<Action>;
  onAdd: (files: File[]) => Promise<string[]>;
  onRemove: (id: string) => void;
  onHome: () => void;
  onReport: () => void;
  onUploadView: () => void;
}

type DialogState = { kind: 'new'; x: number; y: number; draft: IssueDraft } | { kind: 'edit'; id: string } | null;

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3];

export default function Workspace(props: Props) {
  const { state, dispatch } = props;
  const announce = useAnnounce();
  const layout = useLayout();
  const screen = state.screens.find((s) => s.id === state.activeId) ?? state.screens[0];

  const [visionLens, setVisionLens] = useState<VisionLensId | null>(null);
  const [focusLens, setFocusLens] = useState<LensId | null>(null);
  const [severity, setSeverity] = useState<Record<string, number>>({ lowvision: 0.5, cataract: 0.6, glare: 0.7 });
  const [reach, setReach] = useState(false);
  const [hand, setHand] = useState<HandT>('right');
  const [mode, setModeRaw] = useState<Mode>('view');
  const [compare, setCompare] = useState<CompareMode>('slider');
  const [slider, setSlider] = useState(50);
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const [pickTarget, setPickTarget] = useState<'fg' | 'bg' | null>(null);
  const [colors, setColors] = useState({ fg: '#A9A9A9', bg: '#FFFFFF' });
  const [dialog, setDialog] = useState<DialogState>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<'lens' | 'findings' | null>(null);
  const [shortcuts, setShortcuts] = useState(false);
  const [about, setAbout] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [area, setArea] = useState({ w: 800, h: 600 });

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setArea({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setArea({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [screen?.id]);

  useEffect(() => {
    if (!screen) props.onUploadView();
  }, [screen]);

  useEffect(() => {
    setSelectedIssue(null);
    setZoom('fit');
  }, [screen?.id]);

  useEffect(() => {
    if (layout === 'wide') setDrawer(null);
  }, [layout]);

  const setMode = useCallback(
    (m: Mode) => {
      setModeRaw((cur) => {
        const next = cur === m ? 'view' : m;
        if (next !== 'pick') setPickTarget(null);
        const names: Record<Mode, string> = { view: 'View mode', pin: 'Pin mode on', measure: 'Measure mode on', pick: 'Color picker on' };
        announce(names[next]);
        return next;
      });
    },
    [announce],
  );

  const update = useCallback(
    (fn: (s: ScreenMeta) => ScreenMeta) => {
      if (screen) dispatch({ type: 'update', id: screen.id, fn });
    },
    [screen, dispatch],
  );

  // Refs and listeners must be set up before any early return
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const zRef = useRef(1);

  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const start = (e: TouchEvent) => {
      if (e.touches.length === 2) pinch.current = { d: dist(e.touches), z: zRef.current };
    };
    const move = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch.current) {
        e.preventDefault();
        setZoom(Math.max(0.2, Math.min(4, pinch.current.z * (dist(e.touches) / pinch.current.d))));
      }
    };
    const end = () => {
      pinch.current = null;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
    };
  }, [screen?.id]);

  if (!screen) return null;
  const url = state.urls[screen.id];

  // Zoom: 1 = true device size in CSS pixels
  const cssW = screen.width / screen.scale;
  const cssH = screen.height / screen.scale;
  const sideBySide = compare === 'side' && visionLens !== null;
  const availW = Math.max(160, (sideBySide ? (area.w - 48) / 2 : area.w - 32));
  const availH = Math.max(160, area.h - (sideBySide ? 72 : 32));
  const fitZoom = Math.min(availW / cssW, availH / cssH);
  const z = zoom === 'fit' ? fitZoom : zoom;
  const displayW = cssW * z;

  const lensName = visionLens ? lensById(visionLens).name : null;
  const visual = lensVisual(visionLens, severity[visionLens ?? ''] ?? 1, z);

  const zoomBy = (dir: 1 | -1) => {
    const next = dir > 0 ? ZOOM_STEPS.find((s) => s > z + 0.001) : [...ZOOM_STEPS].reverse().find((s) => s < z - 0.001);
    if (next) setZoom(next);
  };

  const defaultAbility = (): Ability => {
    if (reach || mode === 'measure' || focusLens === 'tap' || focusLens === 'reach') return 'motor';
    if (focusLens === 'soundoff') return 'hearing';
    return 'vision';
  };

  const nextNumber = screen.issues.reduce((m, i) => Math.max(m, i.n), 0) + 1;

  const placePin = (x: number, y: number) =>
    setDialog({ kind: 'new', x, y, draft: { ability: defaultAbility(), severity: 'medium', note: '', fix: '' } });

  const saveIssue = (d: IssueDraft) => {
    if (!dialog) return;
    if (dialog.kind === 'new') {
      const issue: Issue = { id: uid(), n: nextNumber, x: dialog.x, y: dialog.y, ...d, lens: visionLens ?? (reach ? 'reach' : undefined) };
      update((s) => ({ ...s, issues: [...s.issues, issue] }));
      setSelectedIssue(issue.id);
      announce(`Issue ${issue.n} added, ${SEVERITY_LABEL[d.severity]} severity, ${ABILITY_LABEL[d.ability]}.`);
    } else {
      update((s) => ({ ...s, issues: s.issues.map((i) => (i.id === dialog.id ? { ...i, ...d } : i)) }));
      announce('Issue updated.');
    }
    setDialog(null);
  };

  const deleteIssue = (id: string) => {
    const i = screen.issues.find((x) => x.id === id);
    update((s) => ({ ...s, issues: s.issues.filter((x) => x.id !== id) }));
    if (selectedIssue === id) setSelectedIssue(null);
    setDialog(null);
    if (i) announce(`Issue ${i.n} deleted.`);
  };

  const onPick = async (x: number, y: number) => {
    if (!pickTarget) return;
    const ctx = await getPixelContext(url);
    const px = Math.min(screen.width - 1, Math.round(x * screen.width));
    const py = Math.min(screen.height - 1, Math.round(y * screen.height));
    const d = ctx.getImageData(px, py, 1, 1).data;
    const hex = rgbToHex(d[0], d[1], d[2]);
    setColors((c) => ({ ...c, [pickTarget]: hex }));
    announce(`${pickTarget === 'fg' ? 'Text' : 'Background'} color ${hex}.`);
    // After the text color, move on to the background
    if (pickTarget === 'fg') setPickTarget('bg');
    else {
      setPickTarget(null);
      setModeRaw('view');
    }
  };

  const startPick = (t: 'fg' | 'bg') => {
    if (pickTarget === t) {
      setPickTarget(null);
      setModeRaw('view');
      return;
    }
    setPickTarget(t);
    setModeRaw('pick');
    if (layout === 'narrow') setDrawer(null);
    announce(`Click the screenshot to pick the ${t === 'fg' ? 'text' : 'background'} color.`);
  };

  const addMeasure = (m: Omit<Measure, 'id'>) => {
    update((s) => ({ ...s, measures: [...s.measures, { ...m, id: uid() }] }));
    announce('Box measured. See the result in the Tap target lens.');
    if (focusLens !== 'tap') setFocusLens('tap');
  };

  const setCheck = (id: string, v: CheckState) => update((s) => ({ ...s, checklist: { ...s.checklist, [id]: v } }));

  const toggleDone = () => {
    const done = screen.status !== 'done';
    update((s) => ({ ...s, status: done ? 'done' : 'in-review' }));
    announce(done ? `${screen.name} marked as done.` : `${screen.name} back in review.`);
  };

  const select = (id: string) => dispatch({ type: 'active', id });

  // Global shortcuts
  keyRef.current = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target) || document.querySelector('dialog[open]') || e.metaKey || e.ctrlKey || e.altKey) return;
    const idx = state.screens.findIndex((s) => s.id === screen.id);
    const k = e.key;
    if (k === 'ArrowRight' && idx < state.screens.length - 1 && !(e.target as HTMLElement)?.closest?.('.stage, input[type=range]')) select(state.screens[idx + 1].id);
    else if (k === 'ArrowLeft' && idx > 0 && !(e.target as HTMLElement)?.closest?.('.stage, input[type=range]')) select(state.screens[idx - 1].id);
    else if (/^[1-9]$/.test(k) && state.screens[Number(k) - 1]) select(state.screens[Number(k) - 1].id);
    else if (k === 'p' || k === 'P') setMode('pin');
    else if (k === 'm' || k === 'M') {
      setFocusLens('tap');
      setMode('measure');
    } else if (k === 'i' || k === 'I') startPick('fg');
    else if (k === 'c' || k === 'C') setCompare((c) => (c === 'slider' ? 'side' : 'slider'));
    else if (k === '+' || k === '=') zoomBy(1);
    else if (k === '-' || k === '_') zoomBy(-1);
    else if (k === '0') setZoom('fit');
    else if (k === 'd' || k === 'D') toggleDone();
    else if (k === '?') setShortcuts(true);
    else if (k === 'Escape') {
      if (drawer) setDrawer(null);
      else if (mode !== 'view') {
        setModeRaw('view');
        setPickTarget(null);
        announce('View mode');
      }
    } else return;
    e.preventDefault();
  };
  zRef.current = z;

  const lensPanel = (
    <LensPanel
      screen={screen}
      focusLens={focusLens}
      visionLens={visionLens}
      severity={severity}
      reach={reach}
      hand={hand}
      measuring={mode === 'measure'}
      onFocusLens={setFocusLens}
      onVision={(l) => {
        setVisionLens(l);
        announce(l ? `${lensById(l).name} lens on.` : 'Showing the original screenshot.');
      }}
      onSeverity={(l, v) => setSeverity((s) => ({ ...s, [l]: v }))}
      onReach={(on) => {
        setReach(on);
        announce(on ? 'Thumb reach zones shown.' : 'Thumb reach zones hidden.');
      }}
      onHand={setHand}
      onMeasureMode={(on) => {
        setModeRaw(on ? 'measure' : 'view');
        if (on) setPickTarget(null);
        if (on && layout === 'narrow') setDrawer(null);
        announce(on ? 'Measure mode on. Drag a box around a control.' : 'View mode');
      }}
      onScale={(sc) => update((s) => ({ ...s, scale: sc }))}
      onDeleteMeasure={(id) => update((s) => ({ ...s, measures: s.measures.filter((m) => m.id !== id) }))}
      onLogMeasure={(m) =>
        setDialog({
          kind: 'new',
          x: m.x + m.w / 2,
          y: m.y + m.h / 2,
          draft: { ability: 'motor', severity: 'medium', note: 'Tap target is smaller than 44 by 44 px', fix: 'Increase the tap target to at least 44 by 44 px.' },
        })
      }
      onCheck={setCheck}
      onClose={layout !== 'wide' ? () => setDrawer(null) : undefined}
    />
  );

  const findingsPanel = (
    <FindingsPanel
      screen={screen}
      selectedIssue={selectedIssue}
      onSelectIssue={(id) => setSelectedIssue(id === selectedIssue ? null : id)}
      onEditIssue={(id) => setDialog({ kind: 'edit', id })}
      onDeleteIssue={deleteIssue}
      colors={colors}
      onColors={setColors}
      pickTarget={pickTarget}
      onPick={startPick}
      onCheck={setCheck}
      onResetChecklist={() => update((s) => ({ ...s, checklist: {} }))}
      onToggleDone={toggleDone}
      onClose={layout === 'narrow' ? () => setDrawer(null) : undefined}
    />
  );

  const editing = dialog?.kind === 'edit' ? screen.issues.find((i) => i.id === dialog.id) : undefined;
  const stageCommon = {
    screen,
    url,
    width: displayW,
    sliderPos: slider,
    onSliderChange: setSlider,
    visual,
    lensName,
    reach,
    hand,
    mode,
    selectedIssue,
    onPlace: placePin,
    onMeasure: addMeasure,
    onPick,
    onSelectIssue: (id: string) => setSelectedIssue(id === selectedIssue ? null : id),
  };
  const layers: Layers = visionLens ? 'both' : 'original';

  const modeBtn = (m: Mode, label: string, Icon: typeof MapPin, key: string) => (
    <button
      className={`tool-btn${mode === m ? ' is-on' : ''}`}
      aria-pressed={mode === m}
      onClick={() => {
        if (m === 'pick') startPick('fg');
        else {
          if (m === 'measure') setFocusLens('tap');
          setMode(m);
        }
      }}
      title={`${label} (${key})`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="tool-label">{label}</span>
    </button>
  );

  return (
    <div className={`workspace layout-${layout}`}>
      <SvgFilters lens={visionLens} severity={severity[visionLens ?? ''] ?? 1} />
      <TopBar
        theme={props.theme}
        setTheme={props.setTheme}
        onHome={props.onHome}
        center={<span className="session-name">Review · {state.screens.length} screen{state.screens.length === 1 ? '' : 's'}</span>}
        actions={
          <>
            <button className="icon-btn" onClick={() => setShortcuts(true)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
              <Keyboard size={20} aria-hidden="true" />
            </button>
            <button className="icon-btn" onClick={() => setAbout(true)} aria-label="About inclusive design" title="About inclusive design">
              <Info size={20} aria-hidden="true" />
            </button>
            <button className="icon-btn" onClick={props.onClear} aria-label="Clear session" title="Clear session">
              <Trash2 size={20} aria-hidden="true" />
            </button>
            <button className="btn btn-primary" onClick={props.onReport}>
              <FileDown size={18} aria-hidden="true" />
              <span className="hide-narrow">Export report</span>
            </button>
          </>
        }
      />

      <div className="ws-body">
        {layout === 'wide' && <aside className="ws-left">{lensPanel}</aside>}
        {layout === 'medium' && (
          <nav className="rail" aria-label="Lens groups">
            {[
              { id: 'vision', Icon: Eye, label: 'Vision lenses' },
              { id: 'motor', Icon: Hand, label: 'Motor lenses' },
              { id: 'hearing', Icon: Ear, label: 'Hearing lens' },
            ].map(({ id, Icon, label }) => (
              <button key={id} className="rail-btn" onClick={() => setDrawer('lens')} aria-label={label} title={label}>
                <Icon size={20} aria-hidden="true" />
              </button>
            ))}
          </nav>
        )}

        <main id="main" className="ws-center" aria-label="Screenshot">
          <div className="toolbar" role="toolbar" aria-label="Canvas tools">
            {layout === 'narrow' && (
              <button className="tool-btn" onClick={() => setDrawer('lens')} aria-haspopup="dialog">
                <Eye size={18} aria-hidden="true" />
                <span className="tool-label">Lenses</span>
              </button>
            )}
            <div className="tool-group" role="group" aria-label="Mode">
              {modeBtn('view', 'View', MousePointer2, 'Esc')}
              {modeBtn('pin', 'Pin', MapPin, 'P')}
              {modeBtn('measure', 'Measure', Ruler, 'M')}
              {modeBtn('pick', 'Pick color', Pipette, 'I')}
            </div>
            <div className="tool-group" role="group" aria-label="Compare">
              <button
                className={`tool-btn${compare === 'slider' ? ' is-on' : ''}`}
                aria-pressed={compare === 'slider'}
                onClick={() => setCompare('slider')}
                disabled={!visionLens}
                title="Before and after slider (C)"
              >
                <SplitSquareHorizontal size={18} aria-hidden="true" />
                <span className="tool-label">Slider</span>
              </button>
              <button
                className={`tool-btn${compare === 'side' ? ' is-on' : ''}`}
                aria-pressed={compare === 'side'}
                onClick={() => setCompare('side')}
                disabled={!visionLens}
                title="Side by side (C)"
              >
                <Columns2 size={18} aria-hidden="true" />
                <span className="tool-label">Side by side</span>
              </button>
            </div>
            <div className="tool-group tool-group-compact" role="group" aria-label="Zoom">
              <button className="tool-btn" onClick={() => zoomBy(-1)} aria-label="Zoom out" title="Zoom out (−)">
                <ZoomOut size={18} aria-hidden="true" />
              </button>
              <span className="zoom-value" aria-live="polite" title="Percent of the real device size">
                {Math.round(z * 100)}%
              </span>
              <button className="tool-btn" onClick={() => zoomBy(1)} aria-label="Zoom in" title="Zoom in (+)">
                <ZoomIn size={18} aria-hidden="true" />
              </button>
              <button className={`tool-btn${zoom === 'fit' ? ' is-on' : ''}`} onClick={() => setZoom('fit')} aria-pressed={zoom === 'fit'} title="Fit to screen (0)">
                <Maximize size={18} aria-hidden="true" />
                <span className="tool-label">Fit</span>
              </button>
            </div>
            {layout === 'narrow' && (
              <button className="tool-btn" onClick={() => setDrawer('findings')} aria-haspopup="dialog">
                <ListChecks size={18} aria-hidden="true" />
                <span className="tool-label">Findings</span>
                {screen.issues.length > 0 && <span className="count">{screen.issues.length}</span>}
              </button>
            )}
          </div>

          {mode !== 'view' && (
            <p className="mode-banner" role="status">
              {mode === 'pin' && 'Pin mode: click the screenshot where you see an issue. Press Esc to stop.'}
              {mode === 'measure' && 'Measure mode: drag a box around a button or icon. Press Esc to stop.'}
              {mode === 'pick' && `Pick the ${pickTarget === 'bg' ? 'background' : 'text'} color on the screenshot. Press Esc to stop.`}
            </p>
          )}

          <div className="canvas-area" ref={areaRef}>
            <div className={`canvas-inner${sideBySide ? ' is-side' : ''}`}>
              {sideBySide ? (
                <>
                  <figure className="side-fig">
                    <Stage {...stageCommon} layers="original" interactive />
                    <figcaption>Original</figcaption>
                  </figure>
                  <figure className="side-fig">
                    <Stage {...stageCommon} layers="sim" />
                    <figcaption>{lensName}</figcaption>
                  </figure>
                </>
              ) : (
                <Stage {...stageCommon} layers={layers} interactive />
              )}
            </div>
          </div>

          {visionLens && compare === 'slider' && (
            <div className="compare-bar">
              <label htmlFor="compare-range">Compare</label>
              <span className="muted small" aria-hidden="true">
                Simulated
              </span>
              <input
                id="compare-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                aria-valuetext={`${100 - slider} percent simulated, ${slider} percent original`}
              />
              <span className="muted small" aria-hidden="true">
                Original
              </span>
            </div>
          )}
          {!visionLens && (
            <p className="compare-hint muted small">
              <HelpCircle size={14} aria-hidden="true" className="inline-icon" /> Choose a vision lens to compare the original with a simulation.
            </p>
          )}
        </main>

        {layout !== 'narrow' && <aside className="ws-right">{findingsPanel}</aside>}
      </div>

      <Filmstrip
        screens={state.screens}
        urls={state.urls}
        activeId={screen.id}
        onSelect={select}
        onMove={(id, to) => dispatch({ type: 'move', id, to })}
        onRename={setRenameId}
        onDelete={setDeleteId}
        onAdd={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        hidden
        multiple
        accept={ACCEPTED.join(',')}
        onChange={async (e) => {
          const errs = await props.onAdd(Array.from(e.target.files ?? []));
          if (errs.length) announce(errs.join(' '));
          e.target.value = '';
        }}
      />

      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(null)}>
          <div
            className={`drawer drawer-${drawer === 'lens' ? 'left' : 'right'}`}
            role="dialog"
            aria-modal="true"
            aria-label={drawer === 'lens' ? 'Lenses' : 'Findings'}
            onClick={(e) => e.stopPropagation()}
            ref={(el) => el?.querySelector<HTMLElement>('button, input')?.focus({ preventScroll: true })}
          >
            {drawer === 'lens' ? lensPanel : findingsPanel}
          </div>
        </div>
      )}

      <IssueDialog
        open={!!dialog}
        number={editing ? editing.n : nextNumber}
        editing={!!editing}
        initial={editing ? draftFrom(editing) : dialog?.kind === 'new' ? dialog.draft : { ability: 'vision', severity: 'medium', note: '', fix: '' }}
        onSave={saveIssue}
        onDelete={editing ? () => deleteIssue(editing.id) : undefined}
        onCancel={() => setDialog(null)}
      />
      <RenameDialog
        open={!!renameId}
        name={state.screens.find((s) => s.id === renameId)?.name ?? ''}
        onSave={(n) => {
          if (renameId) dispatch({ type: 'update', id: renameId, fn: (s) => ({ ...s, name: n }) });
          setRenameId(null);
          announce(`Renamed to ${n}.`);
        }}
        onCancel={() => setRenameId(null)}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Remove this screen?"
        body="The screenshot, its pins and checklist will be removed from this session."
        confirm="Remove screen"
        danger
        onConfirm={() => {
          if (deleteId) props.onRemove(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
      <ShortcutsDialog open={shortcuts} onClose={() => setShortcuts(false)} />
      <AboutDialog open={about} onClose={() => setAbout(false)} />
    </div>
  );
}
