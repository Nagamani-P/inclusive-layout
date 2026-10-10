export type Ability = 'vision' | 'motor' | 'hearing' | 'cognitive';
export type Severity = 'high' | 'medium' | 'low';
export type ScreenStatus = 'not-reviewed' | 'in-review' | 'done';
export type CheckState = 'unset' | 'pass' | 'fail' | 'na';
export type Spectrum = 'Permanent' | 'Temporary' | 'Situational';

export type VisionLensId =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'lowvision'
  | 'cataract'
  | 'glare';

export type LensId = VisionLensId | 'reach' | 'tap' | 'soundoff';

/** Canvas interaction mode */
export type Mode = 'view' | 'pin' | 'measure' | 'pick';
export type CompareMode = 'slider' | 'side';
export type Hand = 'right' | 'left';

/** All positions are normalized 0..1 relative to the image, so they survive zoom. */
export interface Issue {
  id: string;
  n: number;
  x: number;
  y: number;
  ability: Ability;
  severity: Severity;
  note: string;
  fix: string;
  lens?: LensId;
}

export interface Measure {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ScreenMeta {
  id: string;
  name: string;
  width: number;
  height: number;
  /** Image pixels per CSS pixel (1x, 2x, 3x screenshots) */
  scale: number;
  status: ScreenStatus;
  issues: Issue[];
  measures: Measure[];
  checklist: Record<string, CheckState>;
  createdAt: number;
}

export type View = 'landing' | 'upload' | 'review' | 'report';
export type ThemePref = 'light' | 'dark' | 'system';
