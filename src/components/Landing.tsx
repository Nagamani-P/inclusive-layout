import { ArrowRight, Ear, Eye, FileDown, Hand, Images, Lock, ScanEye } from 'lucide-react';
import { Logo, ThemeSwitch } from './ui';
import type { ThemePref } from '../types';

interface Props {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  loaded: boolean;
  screenCount: number;
  onStart: () => void;
  onNew: () => void;
  onSamples: () => void;
}

const SPECTRUM = [
  { ability: 'Vision', Icon: Eye, cells: ['Color blind, low vision', 'Eye infection', 'Bright sunlight'] },
  { ability: 'Motor', Icon: Hand, cells: ['One arm', 'Wrist fracture', 'Holding a baby'] },
  { ability: 'Hearing', Icon: Ear, cells: ['Deaf', 'Ear infection', 'Noisy train'] },
];

export default function Landing({ theme, setTheme, loaded, screenCount, onStart, onNew, onSamples }: Props) {
  return (
    <div className="landing">
      <header className="landing-head">
        <Logo />
        <ThemeSwitch theme={theme} setTheme={setTheme} />
      </header>
      <main id="main" className="landing-main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Free inclusive design review</p>
          <h1 id="hero-title">See your screens the way more people do.</h1>
          <p className="hero-sub">
            Upload UI screenshots and review them through color blindness, low vision, sunlight glare, one-thumb reach and
            sound-off lenses. Pin issues, run the checklist and export a report.
          </p>
          <div className="hero-actions">
            {screenCount > 0 ? (
              <>
                <button className="btn btn-primary btn-lg" onClick={onStart} disabled={!loaded}>
                  Continue review ({screenCount} screen{screenCount === 1 ? '' : 's'})
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button className="btn btn-lg" onClick={onNew}>
                  Add more screens
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={onStart} disabled={!loaded}>
                  Start review
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button className="btn btn-lg" onClick={onSamples} disabled={!loaded}>
                  <Images size={18} aria-hidden="true" />
                  Try sample screens
                </button>
              </>
            )}
          </div>
          <p className="privacy">
            <Lock size={16} aria-hidden="true" />
            Your screenshots never leave this device. No login, no uploads, works offline.
          </p>
        </section>

        <section className="spectrum" aria-labelledby="spectrum-title">
          <h2 id="spectrum-title">One need, three situations</h2>
          <p className="muted">
            Every lens covers permanent, temporary and situational exclusion, following Microsoft's persona spectrum.
          </p>
          <div className="spectrum-grid" role="table" aria-label="Persona spectrum">
            <div role="row" className="spectrum-row spectrum-header">
              <span role="columnheader" className="spectrum-corner">
                <span className="sr-only">Ability</span>
              </span>
              <span role="columnheader">Permanent</span>
              <span role="columnheader">Temporary</span>
              <span role="columnheader">Situational</span>
            </div>
            {SPECTRUM.map(({ ability, Icon, cells }) => (
              <div role="row" className="spectrum-row" key={ability}>
                <span role="rowheader" className="spectrum-ability">
                  <Icon size={18} aria-hidden="true" />
                  {ability}
                </span>
                {cells.map((c, i) => (
                  <span role="cell" className={`spectrum-cell spectrum-${i}`} key={c}>
                    {c}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title" className="sr-only">
            How it works
          </h2>
          <ol className="steps-list">
            <li>
              <Images size={22} aria-hidden="true" />
              <h3>Add screens</h3>
              <p>Drop up to 20 screenshots, paste from the clipboard, or start with the samples.</p>
            </li>
            <li>
              <ScanEye size={22} aria-hidden="true" />
              <h3>Review through lenses</h3>
              <p>Compare original and simulated views, measure tap targets and check contrast.</p>
            </li>
            <li>
              <FileDown size={22} aria-hidden="true" />
              <h3>Export the report</h3>
              <p>Every screen with its pins, notes, fixes and checklist, ready to print or save as PDF.</p>
            </li>
          </ol>
        </section>
      </main>
      <footer className="landing-foot">
        <p>Inclusive Layout. Simulations are approximations that build empathy. They do not replace testing with disabled people.</p>
      </footer>
    </div>
  );
}
