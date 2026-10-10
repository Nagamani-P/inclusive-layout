import type { Ability, LensId, Spectrum } from '../types';

export interface LensDef {
  id: LensId;
  ability: Ability;
  name: string;
  /** Short line under the name */
  short: string;
  spectrum: { kind: Spectrum; example: string }[];
  tip: string;
  /** Has a severity slider */
  severity?: { label: string; min: string; max: string };
  /** Applies a visual simulation to the screenshot */
  simulates?: boolean;
}

export const ABILITIES: { id: Ability; name: string }[] = [
  { id: 'vision', name: 'Vision' },
  { id: 'motor', name: 'Motor' },
  { id: 'hearing', name: 'Hearing' },
];

export const LENSES: LensDef[] = [
  {
    id: 'protanopia',
    ability: 'vision',
    name: 'Protanopia',
    short: 'Red-blind',
    simulates: true,
    spectrum: [{ kind: 'Permanent', example: 'About 1 in 100 men' }],
    tip: 'Reds look dark and muddy and can merge with greens. Never use red alone for errors or "out of stock".',
    severity: { label: 'Severity', min: 'Mild', max: 'Full' },
  },
  {
    id: 'deuteranopia',
    ability: 'vision',
    name: 'Deuteranopia',
    short: 'Green-blind, the most common type',
    simulates: true,
    spectrum: [{ kind: 'Permanent', example: 'About 6 in 100 men have some green weakness' }],
    tip: 'Red and green status colors look almost the same. Add an icon or a word to every status.',
    severity: { label: 'Severity', min: 'Mild', max: 'Full' },
  },
  {
    id: 'tritanopia',
    ability: 'vision',
    name: 'Tritanopia',
    short: 'Blue-yellow confusion',
    simulates: true,
    spectrum: [{ kind: 'Permanent', example: 'Rare, also caused by some eye conditions' }],
    tip: 'Blue and green, and yellow and pink, become hard to tell apart. Check links and info badges.',
    severity: { label: 'Severity', min: 'Mild', max: 'Full' },
  },
  {
    id: 'achromatopsia',
    ability: 'vision',
    name: 'Achromatopsia',
    short: 'No color, only light and dark',
    simulates: true,
    spectrum: [
      { kind: 'Permanent', example: 'Complete color blindness' },
      { kind: 'Situational', example: 'Grayscale or e-ink screen, black and white print' },
    ],
    tip: 'If the screen still works in grayscale, your hierarchy relies on contrast and shape, not hue.',
  },
  {
    id: 'lowvision',
    ability: 'vision',
    name: 'Low vision',
    short: 'Blurred detail',
    simulates: true,
    spectrum: [
      { kind: 'Permanent', example: 'Low vision, uncorrected eyesight' },
      { kind: 'Temporary', example: 'Eye infection, dilated pupils after a checkup' },
      { kind: 'Situational', example: 'Forgot reading glasses' },
    ],
    tip: 'Key actions and prices should stay readable when blurred. Use size and weight, not thin light text.',
    severity: { label: 'Blur', min: 'Slight', max: 'Strong' },
  },
  {
    id: 'cataract',
    ability: 'vision',
    name: 'Cataract haze',
    short: 'Yellowed, low-contrast view',
    simulates: true,
    spectrum: [
      { kind: 'Permanent', example: 'Cataracts, common after 60' },
      { kind: 'Temporary', example: 'Recovering from eye surgery' },
    ],
    tip: 'Haze removes soft contrast first. Light gray text and pale borders disappear.',
    severity: { label: 'Haze', min: 'Light', max: 'Heavy' },
  },
  {
    id: 'glare',
    ability: 'vision',
    name: 'Sunlight glare',
    short: 'Phone outdoors in bright sun',
    simulates: true,
    spectrum: [{ kind: 'Situational', example: 'Paying at an outdoor stall, checking a map on the street' }],
    tip: 'Strong light washes out mid tones. Primary buttons need high contrast with their background.',
    severity: { label: 'Brightness', min: 'Shade', max: 'Midday sun' },
  },
  {
    id: 'reach',
    ability: 'motor',
    name: 'One-thumb reach',
    short: 'Easy, stretch and hard zones',
    spectrum: [
      { kind: 'Permanent', example: 'One arm' },
      { kind: 'Temporary', example: 'Wrist fracture, arm in a sling' },
      { kind: 'Situational', example: 'Holding a baby, carrying shopping bags' },
    ],
    tip: 'Place primary actions in the easy zone near the bottom. Keep destructive actions out of easy reach.',
  },
  {
    id: 'tap',
    ability: 'motor',
    name: 'Tap target size',
    short: 'Draw a box around a control',
    spectrum: [
      { kind: 'Permanent', example: 'Tremor, limited dexterity' },
      { kind: 'Temporary', example: 'Bandaged finger' },
      { kind: 'Situational', example: 'Tapping on a moving bus' },
    ],
    tip: 'Aim for 44 by 44 px. WCAG 2.2 AA sets 24 px as the minimum with spacing around it.',
  },
  {
    id: 'soundoff',
    ability: 'hearing',
    name: 'Sound off',
    short: 'What is lost without audio',
    spectrum: [
      { kind: 'Permanent', example: 'Deaf, hard of hearing' },
      { kind: 'Temporary', example: 'Ear infection' },
      { kind: 'Situational', example: 'Noisy train, phone on silent, baby asleep' },
    ],
    tip: 'Every sound needs a visual partner: captions, a banner, a badge, or a vibration.',
  },
];

export const lensById = (id: LensId) => LENSES.find((l) => l.id === id)!;
