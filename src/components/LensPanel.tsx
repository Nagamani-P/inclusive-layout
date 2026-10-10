import { Ear, Eye, EyeOff, Hand, Lightbulb, Ruler, Trash2, X } from 'lucide-react';
import { ABILITIES, LENSES, lensById } from '../lenses/defs';
import { CHECKLIST, SOUND_OFF_IDS } from '../data/checklist';
import { measureVerdict } from './Stage';
import { Note } from './ui';
import type { Ability, CheckState, Hand as HandT, LensId, Measure, ScreenMeta, VisionLensId } from '../types';
import { ChecklistRow } from './FindingsPanel';

const ICON: Record<Ability, typeof Eye> = { vision: Eye, motor: Hand, hearing: Ear, cognitive: Lightbulb };

interface Props {
  screen: ScreenMeta;
  focusLens: LensId | null;
  visionLens: VisionLensId | null;
  severity: Record<string, number>;
  reach: boolean;
  hand: HandT;
  measuring: boolean;
  onFocusLens: (l: LensId | null) => void;
  onVision: (l: VisionLensId | null) => void;
  onSeverity: (l: LensId, v: number) => void;
  onReach: (on: boolean) => void;
  onHand: (h: HandT) => void;
  onMeasureMode: (on: boolean) => void;
  onScale: (s: number) => void;
  onDeleteMeasure: (id: string) => void;
  onLogMeasure: (m: Measure) => void;
  onCheck: (id: string, v: CheckState) => void;
  onClose?: () => void;
}

export default function LensPanel(p: Props) {
  const isActive = (id: LensId) =>
    id === p.visionLens || (id === 'reach' && p.reach) || (id === 'tap' && p.measuring);

  const activate = (id: LensId) => {
    const def = lensById(id);
    p.onFocusLens(id);
    if (def.ability === 'vision') p.onVision(p.visionLens === id ? null : (id as VisionLensId));
    if (id === 'reach') p.onReach(!p.reach);
    if (id === 'tap') p.onMeasureMode(!p.measuring);
  };

  const cssW = p.screen.width / p.screen.scale;

  return (
    <div className="panel lens-panel">
      <div className="panel-head">
        <h2 className="panel-title">Lenses</h2>
        {p.onClose && (
          <button className="icon-btn" onClick={p.onClose} aria-label="Close lenses panel">
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="panel-scroll">
        <button
          className={`lens-row${p.visionLens === null ? ' is-active' : ''}`}
          aria-pressed={p.visionLens === null}
          onClick={() => {
            p.onVision(null);
            p.onFocusLens(null);
          }}
        >
          <EyeOff size={18} aria-hidden="true" />
          <span className="lens-row-text">
            <span className="lens-name">No simulation</span>
            <span className="lens-short">Show the original screenshot</span>
          </span>
        </button>

        {ABILITIES.map((a) => {
          const Icon = ICON[a.id];
          return (
            <section key={a.id} className="lens-group" aria-labelledby={`grp-${a.id}`}>
              <h3 id={`grp-${a.id}`} className="lens-group-title">
                <Icon size={16} aria-hidden="true" />
                {a.name}
              </h3>
              {LENSES.filter((l) => l.ability === a.id).map((l) => {
                const active = isActive(l.id);
                const open = p.focusLens === l.id;
                return (
                  <div key={l.id} className={`lens-item${open ? ' is-open' : ''}`}>
                    <button
                      className={`lens-row${active ? ' is-active' : ''}`}
                      aria-pressed={l.id === 'soundoff' ? undefined : active}
                      aria-expanded={l.id === 'soundoff' ? open : undefined}
                      onClick={() => (l.id === 'soundoff' ? p.onFocusLens(open ? null : 'soundoff') : activate(l.id))}
                    >
                      <span className={`lens-dot${active ? ' on' : ''}`} aria-hidden="true" />
                      <span className="lens-row-text">
                        <span className="lens-name">{l.name}</span>
                        <span className="lens-short">{l.short}</span>
                      </span>
                    </button>
                    {open && (
                      <div className="lens-detail">
                        <ul className="spectrum-chips" aria-label="Who this affects">
                          {l.spectrum.map((s) => (
                            <li key={s.kind} className={`chip chip-${s.kind.toLowerCase()}`}>
                              <strong>{s.kind}</strong>
                              <span>{s.example}</span>
                            </li>
                          ))}
                        </ul>
                        {l.severity && active && (
                          <div className="slider-field">
                            <label htmlFor={`sev-${l.id}`}>{l.severity.label}</label>
                            <input
                              id={`sev-${l.id}`}
                              type="range"
                              min={0.1}
                              max={1}
                              step={0.05}
                              value={p.severity[l.id] ?? 1}
                              onChange={(e) => p.onSeverity(l.id, Number(e.target.value))}
                              aria-valuetext={`${Math.round((p.severity[l.id] ?? 1) * 100)} percent`}
                            />
                            <div className="slider-ends" aria-hidden="true">
                              <span>{l.severity.min}</span>
                              <span>{l.severity.max}</span>
                            </div>
                          </div>
                        )}

                        {l.id === 'reach' && (
                          <>
                            <div className="segmented segmented-full" role="radiogroup" aria-label="Hand">
                              {(['left', 'right'] as const).map((h) => (
                                <button key={h} role="radio" aria-checked={p.hand === h} className="segmented-item" onClick={() => p.onHand(h)}>
                                  {h === 'left' ? 'Left hand' : 'Right hand'}
                                </button>
                              ))}
                            </div>
                            {cssW > 600 && <Note kind="warn">Reach zones are made for phone screenshots. This screen looks wider than a phone.</Note>}
                          </>
                        )}

                        {l.id === 'tap' && (
                          <>
                            <div className="field-row">
                              <label htmlFor="scale-select">Screenshot density</label>
                              <select
                                id="scale-select"
                                className="input input-sm"
                                value={String(Math.round(p.screen.scale * 100) / 100)}
                                onChange={(e) => p.onScale(Number(e.target.value))}
                              >
                                {[1, 1.5, 2, 3, 4].map((s) => (
                                  <option key={s} value={String(s)}>
                                    {s}x
                                  </option>
                                ))}
                                {![1, 1.5, 2, 3, 4].includes(Math.round(p.screen.scale * 100) / 100) && (
                                  <option value={String(Math.round(p.screen.scale * 100) / 100)}>
                                    {Math.round(p.screen.scale * 100) / 100}x (resized)
                                  </option>
                                )}
                              </select>
                            </div>
                            <p className="muted small">
                              {p.measuring ? 'Drag a box around a button or icon on the screen.' : 'Turn on to start measuring.'}
                            </p>
                            {p.screen.measures.length > 0 && (
                              <ul className="measure-list">
                                {p.screen.measures.map((m, i) => {
                                  const v = measureVerdict(m, p.screen);
                                  return (
                                    <li key={m.id} className={`measure-item measure-item-${v.level}`}>
                                      <Ruler size={16} aria-hidden="true" />
                                      <span className="measure-text">
                                        <strong>
                                          Box {i + 1}: {v.w} × {v.h} px
                                        </strong>
                                        <span>{v.label}</span>
                                      </span>
                                      {v.level !== 'pass' && (
                                        <button className="btn btn-sm" onClick={() => p.onLogMeasure(m)}>
                                          Log issue
                                        </button>
                                      )}
                                      <button className="icon-btn icon-btn-sm" onClick={() => p.onDeleteMeasure(m.id)} aria-label={`Delete box ${i + 1}`}>
                                        <Trash2 size={16} aria-hidden="true" />
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </>
                        )}

                        {l.id === 'soundoff' && (
                          <ul className="checklist checklist-compact">
                            {CHECKLIST.filter((c) => SOUND_OFF_IDS.includes(c.id)).map((c) => (
                              <ChecklistRow key={c.id} item={c} value={p.screen.checklist[c.id] ?? 'unset'} onChange={(v) => p.onCheck(c.id, v)} />
                            ))}
                          </ul>
                        )}

                        <p className="lens-tip">
                          <Lightbulb size={16} aria-hidden="true" />
                          <span>{l.tip}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
