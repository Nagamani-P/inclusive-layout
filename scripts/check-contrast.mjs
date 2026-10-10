// Checks that every theme token pair used for text and UI passes WCAG AA.
// Run: node scripts/check-contrast.mjs
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const themes = {
  light: { bg: '#FFFFFF', surface: '#F4F5F7', text: '#1A1D21', text2: '#4A5058', accent: '#0B6B53', accentInk: '#FFFFFF', border: '#767C84', focus: '#1F5FA8', high: '#B3400A', med: '#8A5A00', low: '#1F5FA8', highSoft: '#FBEAE2', medSoft: '#FAF0DA', lowSoft: '#E4EDF8', doneSoft: '#E3F2EC' },
  dark: { bg: '#121417', surface: '#1C1F24', text: '#EEF0F2', text2: '#AEB4BB', accent: '#5DCAA5', accentInk: '#121417', border: '#8A9199', focus: '#7CB4F0', high: '#FF8A5C', med: '#F2C14E', low: '#7CB4F0', highSoft: '#3A2218', medSoft: '#3A3018', lowSoft: '#1B2B3E', doneSoft: '#173A30' },
};
const pairs = [
  ['text', 'bg', 4.5], ['text', 'surface', 4.5], ['text2', 'bg', 4.5], ['text2', 'surface', 4.5],
  ['accentInk', 'accent', 4.5], ['accent', 'bg', 4.5], ['border', 'bg', 3], ['border', 'surface', 3], ['focus', 'bg', 3],
  ['high', 'bg', 4.5], ['med', 'bg', 4.5], ['low', 'bg', 4.5],
  ['high', 'highSoft', 4.5], ['med', 'medSoft', 4.5], ['low', 'lowSoft', 4.5], ['accent', 'doneSoft', 4.5],
  ['accentInk', 'high', 4.5], ['accentInk', 'med', 4.5], ['accentInk', 'low', 4.5],
];
let fail = 0;
for (const [name, t] of Object.entries(themes)) {
  for (const [f, b, min] of pairs) {
    const r = ratio(t[f], t[b]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(5)} ${f} on ${b}: ${r.toFixed(2)}:1 (needs ${min}:1)`);
  }
}
process.exit(fail ? 1 : 0);
