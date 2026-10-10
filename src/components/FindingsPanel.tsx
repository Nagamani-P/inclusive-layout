import { ArrowLeftRight, Check, CheckCircle2, Minus, Pencil, Pipette, RotateCcw, Trash2, X } from 'lucide-react';
import { CHECKLIST, type CheckItem } from '../data/checklist';
import { ABILITY_LABEL } from '../data/tips';
import { evaluate, hexToRgb } from '../utils/contrast';
import { PinGlyph, SeverityBadge } from './ui';
import type { CheckState, ScreenMeta } from '../types';

export function ChecklistRow({ item, value, onChange }: { item: CheckItem; value: CheckState; onChange: (v: CheckState) => void }) {
  const opts: { v: CheckState; label: string; Icon: typeof Check }[] = [
    { v: 'pass', label: 'Pass', Icon: Check },
    { v: 'fail', label: 'Fail', Icon: X },
    { v: 'na', label: 'N/A', Icon: Minus },
  ];
  const id = `chk-${item.id}`;
  return (
    <li className={`check-row check-${value}`}>
      <div className="check-text">
        <span id={id} className="check-label">
          {item.label}
        </span>
        <span className="check-hint">{item.hint}</span>
      </div>
      <div className="check-options" role="radiogroup" aria-labelledby={id}>
        {opts.map(({ v, label, Icon }) => (
          <button
            key={v}
            role="radio"
            aria-checked={value === v}
            className={`check-opt check-opt-${v}`}
            onClick={() => onChange(value === v ? 'unset' : v)}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </li>
  );
}

interface Props {
  screen: ScreenMeta;
  selectedIssue: string | null;
  onSelectIssue: (id: string) => void;
  onEditIssue: (id: string) => void;
  onDeleteIssue: (id: string) => void;
  colors: { fg: string; bg: string };
  onColors: (c: { fg: string; bg: string }) => void;
  pickTarget: 'fg' | 'bg' | null;
  onPick: (t: 'fg' | 'bg') => void;
  onCheck: (id: string, v: CheckState) => void;
  onResetChecklist: () => void;
  onToggleDone: () => void;
  onClose?: () => void;
}

function ColorField({ label, value, onChange, picking, onPick }: { label: string; value: string; onChange: (v: string) => void; picking: boolean; onPick: () => void }) {
  const valid = !!hexToRgb(value);
  const id = `color-${label.replace(/\s/g, '')}`;
  return (
    <div className="color-field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="color-input-row">
        <span className="swatch" style={{ background: valid ? value : 'transparent' }} aria-hidden="true" />
        <input
          id={id}
          className="input input-sm mono"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-invalid={!valid}
          spellCheck={false}
          maxLength={7}
        />
        <button className={`icon-btn${picking ? ' is-on' : ''}`} onClick={onPick} aria-pressed={picking} aria-label={`Pick ${label.toLowerCase()} from the screen`}>
          <Pipette size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function Verdict({ ok, label, need }: { ok: boolean; label: string; need: string }) {
  return (
    <li className={`verdict ${ok ? 'verdict-pass' : 'verdict-fail'}`}>
      {ok ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
      <span>
        {label} <span className="muted">({need})</span>
      </span>
      <strong>{ok ? 'Pass' : 'Fail'}</strong>
    </li>
  );
}

export default function FindingsPanel(p: Props) {
  const { screen } = p;
  const result = evaluate(p.colors.fg, p.colors.bg);
  const done = screen.status === 'done';
  const answered = CHECKLIST.filter((c) => (screen.checklist[c.id] ?? 'unset') !== 'unset').length;
  const fails = CHECKLIST.filter((c) => screen.checklist[c.id] === 'fail').length;
  const issues = [...screen.issues].sort((a, b) => a.n - b.n);

  return (
    <div className="panel findings-panel">
      <div className="panel-head">
        <h2 className="panel-title">Findings</h2>
        {p.onClose && (
          <button className="icon-btn" onClick={p.onClose} aria-label="Close findings panel">
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="panel-scroll">
        <details className="fold" open>
          <summary>
            <h3>Issues</h3>
            <span className="count">{issues.length}</span>
          </summary>
          {issues.length === 0 ? (
            <p className="empty">No issues yet. Turn on Pin mode (P) and click the screenshot where something excludes people.</p>
          ) : (
            <ol className="issue-list">
              {issues.map((i) => (
                <li key={i.id} className={`issue${p.selectedIssue === i.id ? ' is-selected' : ''}`}>
                  <button className="issue-main" onClick={() => p.onSelectIssue(i.id)} aria-current={p.selectedIssue === i.id ? 'true' : undefined}>
                    <PinGlyph severity={i.severity} n={i.n} />
                    <span className="issue-body">
                      <span className="issue-tags">
                        <SeverityBadge severity={i.severity} />
                        <span className="badge badge-neutral">{ABILITY_LABEL[i.ability]}</span>
                      </span>
                      <span className="issue-note">{i.note || 'No note'}</span>
                      {i.fix && <span className="issue-fix">Fix: {i.fix}</span>}
                    </span>
                  </button>
                  <div className="issue-actions">
                    <button className="icon-btn icon-btn-sm" onClick={() => p.onEditIssue(i.id)} aria-label={`Edit issue ${i.n}`}>
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button className="icon-btn icon-btn-sm" onClick={() => p.onDeleteIssue(i.id)} aria-label={`Delete issue ${i.n}`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </details>

        <details className="fold" open>
          <summary>
            <h3>Contrast checker</h3>
          </summary>
          <div className="contrast">
            <div className="contrast-fields">
              <ColorField label="Text color" value={p.colors.fg} onChange={(fg) => p.onColors({ ...p.colors, fg })} picking={p.pickTarget === 'fg'} onPick={() => p.onPick('fg')} />
              <button className="icon-btn swap-btn" onClick={() => p.onColors({ fg: p.colors.bg, bg: p.colors.fg })} aria-label="Swap colors">
                <ArrowLeftRight size={18} aria-hidden="true" />
              </button>
              <ColorField label="Background" value={p.colors.bg} onChange={(bg) => p.onColors({ ...p.colors, bg })} picking={p.pickTarget === 'bg'} onPick={() => p.onPick('bg')} />
            </div>
            {result ? (
              <>
                <div className="contrast-preview" style={{ color: p.colors.fg, background: p.colors.bg }}>
                  <span className="contrast-sample">Aa Sample text</span>
                  <span className="contrast-ratio" aria-live="polite">
                    {result.ratio.toFixed(2)}:1
                  </span>
                </div>
                <ul className="verdicts">
                  <Verdict ok={result.normalAA} label="Body text AA" need="4.5:1" />
                  <Verdict ok={result.largeAA} label="Large text AA" need="3:1" />
                  <Verdict ok={result.ui} label="Icons and borders" need="3:1" />
                  <Verdict ok={result.normalAAA} label="Body text AAA" need="7:1" />
                </ul>
              </>
            ) : (
              <p className="field-error">Enter two colors as hex, for example #1A1D21.</p>
            )}
            {p.pickTarget && <p className="muted small">Click the screenshot to pick the {p.pickTarget === 'fg' ? 'text' : 'background'} color.</p>}
          </div>
        </details>

        <details className="fold" open>
          <summary>
            <h3>Checklist</h3>
            <span className="count">
              {answered}/{CHECKLIST.length}
              {fails > 0 ? ` · ${fails} fail` : ''}
            </span>
          </summary>
          <ul className="checklist">
            {CHECKLIST.map((c) => (
              <ChecklistRow key={c.id} item={c} value={screen.checklist[c.id] ?? 'unset'} onChange={(v) => p.onCheck(c.id, v)} />
            ))}
          </ul>
          {answered > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={p.onResetChecklist}>
              <RotateCcw size={14} aria-hidden="true" />
              Reset checklist
            </button>
          )}
        </details>
      </div>
      <div className="panel-foot">
        <button className={`btn btn-block ${done ? '' : 'btn-primary'}`} onClick={p.onToggleDone} aria-pressed={done}>
          <CheckCircle2 size={18} aria-hidden="true" />
          {done ? 'Done · mark as in review' : 'Mark screen as done'}
        </button>
      </div>
    </div>
  );
}
