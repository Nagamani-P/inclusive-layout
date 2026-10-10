import type { Ability } from '../types';

export interface CheckItem {
  id: string;
  ability: Ability;
  label: string;
  hint: string;
}

export const CHECKLIST: CheckItem[] = [
  { id: 'color-only', ability: 'vision', label: 'Information is not shown by color alone', hint: 'Status, errors and links also use an icon, text or underline.' },
  { id: 'text-contrast', ability: 'vision', label: 'Body text contrast is at least 4.5:1', hint: 'Use the contrast checker on the lightest text.' },
  { id: 'large-contrast', ability: 'vision', label: 'Large text, icons and borders are at least 3:1', hint: 'Applies to input borders and icon buttons too.' },
  { id: 'blur-readable', ability: 'vision', label: 'Text is 14 px or larger and readable when blurred', hint: 'Check with the Low vision lens.' },
  { id: 'tap-size', ability: 'motor', label: 'Tap targets are at least 44 by 44 px', hint: 'Measure small icons with the Tap target tool.' },
  { id: 'thumb-reach', ability: 'motor', label: 'Primary actions are reachable with one thumb', hint: 'Check with the One-thumb reach lens.' },
  { id: 'captions', ability: 'hearing', label: 'Audio and video have captions or a transcript', hint: 'Mark N/A if the screen has no media.' },
  { id: 'visual-alerts', ability: 'hearing', label: 'Alerts have a visual cue, not sound only', hint: 'Banners, badges or vibration for new orders and messages.' },
  { id: 'no-audio-only', ability: 'hearing', label: 'No step depends on hearing a sound', hint: 'For example voice OTP with no text option.' },
  { id: 'labels', ability: 'cognitive', label: 'Labels sit outside inputs, not placeholder only', hint: 'Placeholders vanish while typing.' },
  { id: 'one-primary', ability: 'cognitive', label: 'Each screen has one clear primary action', hint: 'Competing buttons slow everyone down.' },
  { id: 'errors', ability: 'cognitive', label: 'Error messages say what happened and how to fix it', hint: '"Enter a 6 digit PIN code" beats "Invalid".' },
];

export const SOUND_OFF_IDS = ['captions', 'visual-alerts', 'no-audio-only'];
