import { useEffect, useState } from 'react';
import { Modal } from './Dialogs';
import { SeverityIcon, SEVERITY_LABEL } from './ui';
import { ABILITY_LABEL, FIX_TIPS } from '../data/tips';
import type { Ability, Issue, Severity } from '../types';

export interface IssueDraft {
  ability: Ability;
  severity: Severity;
  note: string;
  fix: string;
}

interface Props {
  open: boolean;
  number: number;
  initial: IssueDraft;
  editing: boolean;
  onSave: (d: IssueDraft) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const ABILITIES: Ability[] = ['vision', 'motor', 'hearing', 'cognitive'];
const SEVERITIES: Severity[] = ['high', 'medium', 'low'];

export default function IssueDialog({ open, number, initial, editing, onSave, onDelete, onCancel }: Props) {
  const [d, setD] = useState<IssueDraft>(initial);
  useEffect(() => {
    if (open) setD(initial);
  }, [open]);

  return (
    <Modal open={open} onClose={onCancel} title={editing ? `Edit issue ${number}` : `Add issue ${number}`}>
      <form
        className="issue-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(d);
        }}
      >
        <fieldset>
          <legend className="field-label">Ability affected</legend>
          <div className="choice-row">
            {ABILITIES.map((a) => (
              <label key={a} className={`choice${d.ability === a ? ' is-on' : ''}`}>
                <input type="radio" name="ability" value={a} checked={d.ability === a} onChange={() => setD({ ...d, ability: a, fix: '' })} />
                {ABILITY_LABEL[a]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">Severity</legend>
          <div className="choice-row">
            {SEVERITIES.map((s) => (
              <label key={s} className={`choice choice-sev sev-${s}${d.severity === s ? ' is-on' : ''}`}>
                <input type="radio" name="severity" value={s} checked={d.severity === s} onChange={() => setD({ ...d, severity: s })} />
                <SeverityIcon severity={s} />
                {SEVERITY_LABEL[s]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field-label" htmlFor="issue-note">
          What is the problem?
        </label>
        <textarea
          id="issue-note"
          className="input"
          rows={3}
          value={d.note}
          onChange={(e) => setD({ ...d, note: e.target.value })}
          placeholder="For example: stock status uses only a red or green dot"
          autoFocus
        />

        <label className="field-label" htmlFor="issue-tip">
          Suggested fix
        </label>
        <select
          id="issue-tip"
          className="input"
          value=""
          onChange={(e) => e.target.value && setD({ ...d, fix: e.target.value })}
        >
          <option value="">Choose a common fix…</option>
          {FIX_TIPS[d.ability].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="issue-fix">
          Fix details
        </label>
        <textarea
          id="issue-fix"
          className="input"
          rows={2}
          value={d.fix}
          onChange={(e) => setD({ ...d, fix: e.target.value })}
          placeholder="Or write your own fix"
        />

        <div className="modal-foot modal-foot-inline">
          {editing && onDelete && (
            <button type="button" className="btn btn-ghost btn-danger-text" onClick={onDelete}>
              Delete issue
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editing ? 'Save changes' : 'Add issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export const draftFrom = (i: Issue): IssueDraft => ({ ability: i.ability, severity: i.severity, note: i.note, fix: i.fix });
