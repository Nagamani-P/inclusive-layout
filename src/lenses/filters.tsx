import type { CSSProperties } from 'react';
import type { LensId } from '../types';

/**
 * Color vision deficiency matrices from Machado, Oliveira and Fernandes (2009),
 * severity 1.0. They are defined for linear RGB, which is exactly what an SVG
 * feColorMatrix uses with color-interpolation-filters="linearRGB".
 */
const CVD: Record<string, number[]> = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
  achromatopsia: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722],
};

const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];

/** Blend identity and the full matrix to approximate anomalous (partial) forms. */
function matrixValues(lens: string, severity: number): string {
  const m = CVD[lens];
  const s = Math.max(0, Math.min(1, severity));
  const v = m.map((x, i) => IDENTITY[i] + (x - IDENTITY[i]) * s);
  // feColorMatrix wants a 4x5 matrix
  return [
    v[0], v[1], v[2], 0, 0,
    v[3], v[4], v[5], 0, 0,
    v[6], v[7], v[8], 0, 0,
    0, 0, 0, 1, 0,
  ].map((n) => n.toFixed(6)).join(' ');
}

export const FILTER_ID = 'il-cvd-filter';

/** Hidden SVG holding the active color matrix filter. */
export function SvgFilters({ lens, severity }: { lens: LensId | null; severity: number }) {
  const show = lens && CVD[lens];
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id={FILTER_ID} colorInterpolationFilters="linearRGB">
          <feColorMatrix type="matrix" values={show ? matrixValues(lens!, lens === 'achromatopsia' ? 1 : severity) : matrixValues('protanopia', 0)} />
        </filter>
      </defs>
    </svg>
  );
}

export interface LensVisual {
  filter: string;
  overlay?: CSSProperties;
}

/**
 * CSS filter and overlay for a lens.
 * @param k display scale relative to a 400 px wide phone, so blur looks the same at any zoom.
 */
export function lensVisual(lens: LensId | null, severity: number, k: number): LensVisual {
  const s = Math.max(0, Math.min(1, severity));
  switch (lens) {
    case 'protanopia':
    case 'deuteranopia':
    case 'tritanopia':
    case 'achromatopsia':
      return { filter: `url(#${FILTER_ID})` };
    case 'lowvision':
      return { filter: `blur(${(0.6 + s * 4.4) * k}px)` };
    case 'cataract':
      return {
        filter: `blur(${(0.3 + s * 1.4) * k}px) contrast(${1 - 0.5 * s}) sepia(${0.25 + 0.45 * s}) brightness(${1 + 0.06 * s})`,
        overlay: { background: `rgba(255, 248, 230, ${0.12 + 0.28 * s})` },
      };
    case 'glare':
      return {
        filter: `contrast(${1 - 0.55 * s}) brightness(${1 + 0.3 * s}) saturate(${1 - 0.45 * s})`,
        overlay: {
          background: `radial-gradient(ellipse at 70% 25%, rgba(255,255,255,${0.35 + 0.5 * s}) 0%, rgba(255,255,255,${0.15 + 0.25 * s}) 45%, rgba(255,255,255,${0.05 + 0.1 * s}) 100%)`,
        },
      };
    default:
      return { filter: 'none' };
  }
}
