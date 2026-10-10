import { useEffect, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { CHECKLIST } from '../data/checklist';
import { ABILITY_LABEL } from '../data/tips';
import { PinGlyph, SeverityBadge, StatusBadge, Logo } from './ui';
import type { CheckState, ScreenMeta, Severity } from '../types';

const CHECK_LABEL: Record<CheckState, string> = { pass: 'Pass', fail: 'Fail', na: 'N/A', unset: 'Not checked' };

export default function Report({ screens, urls, onBack }: { screens: ScreenMeta[]; urls: Record<string, string>; onBack: () => void }) {
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headRef.current?.focus(), []);

  const all = screens.flatMap((s) => s.issues);
  const bySev = (sev: Severity) => all.filter((i) => i.severity === sev).length;
  const byAbility = (['vision', 'motor', 'hearing', 'cognitive'] as const).map((a) => ({ a, n: all.filter((i) => i.ability === a).length }));
  const date = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  const done = screens.filter((s) => s.status === 'done').length;

  return (
    <div className="report-page">
      <div className="report-toolbar no-print">
        <button className="btn" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to review
        </button>
        <p className="muted small">Use Print, then choose "Save as PDF" as the destination.</p>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" />
          Print or save as PDF
        </button>
      </div>

      <main id="main" className="report">
        <section className="report-cover">
          <Logo />
          <h1 ref={headRef} tabIndex={-1}>
            Inclusive design review
          </h1>
          <p className="muted">
            {date} · {screens.length} screen{screens.length === 1 ? '' : 's'} · {done} marked done
          </p>
          <div className="report-stats">
            <div className="stat">
              <span className="stat-num">{all.length}</span>
              <span className="stat-label">Issues found</span>
            </div>
            {(['high', 'medium', 'low'] as const).map((s) => (
              <div className="stat" key={s}>
                <span className="stat-num">{bySev(s)}</span>
                <SeverityBadge severity={s} />
              </div>
            ))}
          </div>
          <table className="report-table compact">
            <caption className="sr-only">Issues by ability</caption>
            <thead>
              <tr>
                {byAbility.map(({ a }) => (
                  <th key={a} scope="col">
                    {ABILITY_LABEL[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {byAbility.map(({ a, n }) => (
                  <td key={a}>{n}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        {screens.map((s, idx) => {
          const issues = [...s.issues].sort((a, b) => a.n - b.n);
          const answered = CHECKLIST.filter((c) => (s.checklist[c.id] ?? 'unset') !== 'unset');
          return (
            <section key={s.id} className="report-screen" aria-labelledby={`rs-${s.id}`}>
              <header className="report-screen-head">
                <h2 id={`rs-${s.id}`}>
                  {idx + 1}. {s.name}
                </h2>
                <StatusBadge status={s.status} />
              </header>
              <div className="report-screen-body">
                <figure className="report-figure">
                  <div className="report-shot">
                    <img src={urls[s.id]} alt={`Screenshot: ${s.name}`} />
                    {issues.map((i) => (
                      <span key={i.id} className="pin pin-static" style={{ left: `${i.x * 100}%`, top: `${i.y * 100}%` }} aria-hidden="true">
                        <PinGlyph severity={i.severity} n={i.n} />
                      </span>
                    ))}
                  </div>
                </figure>
                <div className="report-details">
                  <h3>Issues ({issues.length})</h3>
                  {issues.length ? (
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Severity</th>
                          <th scope="col">Ability</th>
                          <th scope="col">Problem and fix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issues.map((i) => (
                          <tr key={i.id}>
                            <td>{i.n}</td>
                            <td>
                              <SeverityBadge severity={i.severity} />
                            </td>
                            <td>{ABILITY_LABEL[i.ability]}</td>
                            <td>
                              <span className="cell-note">{i.note || 'No note'}</span>
                              {i.fix && <span className="cell-fix">Fix: {i.fix}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="muted">No issues logged.</p>
                  )}

                  <h3>Checklist ({answered.length} of {CHECKLIST.length} checked)</h3>
                  <ul className="report-checks">
                    {CHECKLIST.map((c) => {
                      const v = s.checklist[c.id] ?? 'unset';
                      return (
                        <li key={c.id} className={`report-check rc-${v}`}>
                          <span className="rc-state">{CHECK_LABEL[v]}</span>
                          <span>{c.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
        <footer className="report-foot">Generated with Inclusive Layout</footer>
      </main>
    </div>
  );
}
