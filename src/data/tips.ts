import type { Ability } from '../types';

/** Built-in fix suggestions, grouped by ability. */
export const FIX_TIPS: Record<Ability, string[]> = {
  vision: [
    'Add an icon and a text label next to the status color.',
    'Darken the text to reach at least 4.5:1 contrast.',
    'Raise border or icon contrast to at least 3:1.',
    'Increase font size to 16 px and use a heavier weight.',
    'Underline links so they do not rely on color.',
    'Use patterns or labels in charts instead of hue only.',
  ],
  motor: [
    'Increase the tap target to at least 44 by 44 px.',
    'Add at least 8 px spacing between adjacent targets.',
    'Move the primary action to the bottom of the screen.',
    'Use a sticky bottom bar for the main action.',
    'Move destructive actions away from frequent taps.',
    'Offer an alternative to swipe or long-press gestures.',
  ],
  hearing: [
    'Add captions or a transcript to the video.',
    'Show a visual banner or badge with every sound alert.',
    'Offer a text option for voice-only verification.',
    'Support vibration for important notifications.',
  ],
  cognitive: [
    'Use a visible label above the input field.',
    'Keep one clear primary button per screen.',
    'Write the error as what happened plus how to fix it.',
    'Reduce the number of competing promotions.',
    'Break long forms into short steps.',
  ],
};

export const ABILITY_LABEL: Record<Ability, string> = {
  vision: 'Vision',
  motor: 'Motor',
  hearing: 'Hearing',
  cognitive: 'Cognitive',
};
