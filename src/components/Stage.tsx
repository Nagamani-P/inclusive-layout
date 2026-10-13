import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { PinGlyph, SEVERITY_LABEL } from './ui';
import { ABILITY_LABEL } from '../data/tips';
import type { Hand, Issue, Measure, Mode, ScreenMeta } from '../types';
import type { LensVisual } from '../lenses/filters';

export type Layers = 'original' | 'sim' | 'both';

interface Props {
  screen: ScreenMeta;
  url: string;
  width: number;
  layers: Layers;
  sliderPos: number;
  visual: LensVisual;
  lensName: string | null;
  reach: boolean;
  hand: Hand;
  mode: Mode;
  selectedIssue: string | null;
  onPlace: (x: number, y: number) => void;
  onMeasure: (m: Omit<Measure, 'id'>) => void;
  onPick: (x: number, y: number) => void;
  onSelectIssue: (id: string) => void;
  /** Drag the compare divider on the image */
  onSliderChange?: (pos: number) => void;
  /** Only the primary stage takes keyboard pin placement */
  interactive?: boolean;
}

export function measureVerdict(m: Measure, s: ScreenMeta) {
  const w = (m.w * s.width) / s.scale;
  const h = (m.h * s.height) / s.scale;
  const min = Math.min(w, h);
  const level: 'pass' | 'aa' | 'fail' = min >= 44 ? 'pass' : min >= 24 ? 'aa' : 'fail';
  const label = level === 'pass' ? 'Pass, 44 px or more' : level === 'aa' ? 'Below 44 px, meets 24 px AA minimum' : 'Fails, under 24 px';
  return { w: Math.round(w), h: Math.round(h), level, label };
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const circlePath = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

export default function Stage(p: Props) {
  const { screen, width } = p;
  const height = (width * screen.height) / screen.width;
  const ref = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [cross, setCross] = useState({ x: 0.5, y: 0.5 });
  const [focused, setFocused] = useState(false);
  const [sliding, setSliding] = useState(false);
  const canSlide = p.layers === 'both' && !!p.onSliderChange;

  const slideTo = (e: PointerEvent) => p.onSliderChange?.(Math.round(norm(e).x * 100));
  const startSlide = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    e.preventDefault();
    ref.current!.setPointerCapture(e.pointerId);
    setSliding(true);
    slideTo(e);
  };

  const norm = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // In View mode, dragging anywhere on the image moves the compare divider
    if (p.mode === 'view' && canSlide) return startSlide(e);
    if (p.mode !== 'measure' || e.button !== 0) return;
    const { x, y } = norm(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraft({ x0: x, y0: y, x1: x, y1: y });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (sliding) return slideTo(e);
    if (!draft) return;
    const { x, y } = norm(e);
    setDraft({ ...draft, x1: x, y1: y });
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (sliding) {
      setSliding(false);
      return;
    }
    if (p.mode === 'measure' && draft) {
      const m = { x: Math.min(draft.x0, draft.x1), y: Math.min(draft.y0, draft.y1), w: Math.abs(draft.x1 - draft.x0), h: Math.abs(draft.y1 - draft.y0) };
      setDraft(null);
      if (m.w * width > 4 && m.h * height > 4) p.onMeasure(m);
      return;
    }
    if (e.button !== 0) return;
    const { x, y } = norm(e);
    if (p.mode === 'pin') p.onPlace(x, y);
    if (p.mode === 'pick') p.onPick(x, y);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (p.mode !== 'pin' && p.mode !== 'pick') return;
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      setCross((c) => ({ x: clamp(c.x + moves[e.key][0]), y: clamp(c.y + moves[e.key][1]) }));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (p.mode === 'pin') p.onPlace(cross.x, cross.y);
      else p.onPick(cross.x, cross.y);
    }
  };

  const showSim = p.layers !== 'original';
  const simClip: CSSProperties = p.layers === 'both' ? { clipPath: `inset(0 0 0 ${p.sliderPos}%)` } : {};
  const keyboardMode = p.interactive && (p.mode === 'pin' || p.mode === 'pick');

  // Reach zones live in device CSS pixel space
  const cssW = screen.width / screen.scale;
  const cssH = screen.height / screen.scale;
  const unit = cssW / 390;
  const px = p.hand === 'right' ? cssW + 10 * unit : -10 * unit;
  const py = cssH + 20 * unit;

  const modeLabel =
    p.mode === 'pin'
      ? 'Pin mode. Click to add an issue, or use arrow keys to move the crosshair and Enter to drop a pin.'
      : p.mode === 'measure'
        ? 'Measure mode. Drag a box around a control to check its size.'
        : p.mode === 'pick'
          ? 'Color picker. Click a color, or use arrow keys and Enter.'
          : undefined;

  return (
    <div
      ref={ref}
      className={`stage mode-${p.mode}${canSlide && p.mode === 'view' ? ' can-slide' : ''}${sliding ? ' is-sliding' : ''}`}
      style={{ width, height }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setSliding(false)}
      onKeyDown={keyboardMode ? onKeyDown : undefined}
      tabIndex={keyboardMode ? 0 : undefined}
      role={keyboardMode ? 'application' : undefined}
      aria-label={keyboardMode ? `${screen.name}. ${modeLabel}` : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {p.layers !== 'sim' && <img className="stage-img" src={p.url} alt={`Screenshot: ${screen.name}`} draggable={false} />}
      {showSim && (
        <div className="sim-layer" style={simClip} aria-hidden={p.layers === 'both'}>
          <img
            className="stage-img"
            src={p.url}
            alt={p.layers === 'sim' ? `Screenshot: ${screen.name}, simulated with ${p.lensName}` : ''}
            style={{ filter: p.visual.filter }}
            draggable={false}
          />
          {p.visual.overlay && <div className="sim-overlay" style={p.visual.overlay} />}
        </div>
      )}
      {p.layers === 'both' && (
        <>
          <div
            className={`compare-divider${canSlide ? ' is-draggable' : ''}`}
            style={{ left: `${p.sliderPos}%` }}
            aria-hidden="true"
            onPointerDown={canSlide ? startSlide : undefined}
          >
            <span className="compare-knob" />
          </div>
          <span className="stage-tag stage-tag-left" aria-hidden="true">
            Original
          </span>
          <span className="stage-tag stage-tag-right" aria-hidden="true">
            {p.lensName}
          </span>
        </>
      )}
      {p.layers !== 'both' && (
        <span className="stage-tag stage-tag-left" aria-hidden="true">
          {p.layers === 'sim' ? p.lensName : 'Original'}
        </span>
      )}

      {p.reach && (
        <svg className="reach" viewBox={`0 0 ${cssW} ${cssH}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id={`hatch-${screen.id}-${p.layers}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="12" height="12" className="reach-hard-fill" />
              <line x1="0" y1="0" x2="0" y2="12" className="reach-hard-line" />
            </pattern>
            <pattern id={`dots-${screen.id}-${p.layers}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" className="reach-stretch-fill" />
              <circle cx="5" cy="5" r="1.3" className="reach-stretch-dot" />
            </pattern>
          </defs>
          {/* Hard: the screen minus the stretch circle. Stretch: a ring between the two circles. */}
          <path d={`M0 0H${cssW}V${cssH}H0Z ${circlePath(px, py, 430 * unit)}`} fillRule="evenodd" fill={`url(#hatch-${screen.id}-${p.layers})`} />
          <path d={`${circlePath(px, py, 430 * unit)} ${circlePath(px, py, 300 * unit)}`} fillRule="evenodd" fill={`url(#dots-${screen.id}-${p.layers})`} />
          <path d={circlePath(px, py, 300 * unit)} className="reach-easy" />
          <path d={circlePath(px, py, 430 * unit)} className="reach-edge" />
          <g className="reach-labels" fontSize={18 * unit}>
            <text x={p.hand === 'right' ? cssW - 70 * unit : 16 * unit} y={cssH - 90 * unit}>Easy</text>
            <text x={p.hand === 'right' ? cssW - 300 * unit : 220 * unit} y={cssH - 300 * unit}>Stretch</text>
            <text x={p.hand === 'right' ? 16 * unit : cssW - 70 * unit} y={140 * unit}>Hard</text>
          </g>
        </svg>
      )}

      {screen.measures.map((m) => {
        const v = measureVerdict(m, screen);
        return (
          <div
            key={m.id}
            className={`measure measure-${v.level}`}
            style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${m.w * 100}%`, height: `${m.h * 100}%` }}
            aria-hidden="true"
          >
            <span className="measure-label">
              {v.w}×{v.h}
              {v.level === 'pass' ? ' ✓' : v.level === 'aa' ? ' !' : ' ✕'}
            </span>
          </div>
        );
      })}
      {draft && (
        <div
          className="measure measure-draft"
          style={{
            left: `${Math.min(draft.x0, draft.x1) * 100}%`,
            top: `${Math.min(draft.y0, draft.y1) * 100}%`,
            width: `${Math.abs(draft.x1 - draft.x0) * 100}%`,
            height: `${Math.abs(draft.y1 - draft.y0) * 100}%`,
          }}
          aria-hidden="true"
        />
      )}

      {screen.issues.map((i: Issue) => (
        <button
          key={i.id}
          className={`pin${p.selectedIssue === i.id ? ' is-selected' : ''}`}
          style={{ left: `${i.x * 100}%`, top: `${i.y * 100}%` }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            p.onSelectIssue(i.id);
          }}
          aria-label={`Issue ${i.n}, ${SEVERITY_LABEL[i.severity]} severity, ${ABILITY_LABEL[i.ability]}${i.note ? `: ${i.note}` : ''}`}
          tabIndex={p.interactive ? 0 : -1}
        >
          <PinGlyph severity={i.severity} n={i.n} />
        </button>
      ))}

      {keyboardMode && focused && (
        <span className="crosshair" style={{ left: `${cross.x * 100}%`, top: `${cross.y * 100}%` }} aria-hidden="true" />
      )}
    </div>
  );
}
