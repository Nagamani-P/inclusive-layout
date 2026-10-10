import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Accessible modal built on the native dialog element (focus trap and Esc for free). */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal${wide ? ' modal-wide' : ''}`}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="modal-inner">
          <header className="modal-head">
            <h2 id="modal-title">{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={20} aria-hidden="true" />
            </button>
          </header>
          <div className="modal-body">{children}</div>
          {footer && <footer className="modal-foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog(p: {
  open: boolean;
  title: string;
  body: string;
  confirm: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={p.open}
      onClose={p.onCancel}
      title={p.title}
      footer={
        <>
          <button className="btn" onClick={p.onCancel}>
            Cancel
          </button>
          <button className={`btn ${p.danger ? 'btn-danger' : 'btn-primary'}`} onClick={p.onConfirm}>
            {p.confirm}
          </button>
        </>
      }
    >
      <p>{p.body}</p>
    </Modal>
  );
}

export function RenameDialog({ open, name, onSave, onCancel }: { open: boolean; name: string; onSave: (n: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(name);
  useEffect(() => setValue(name), [name, open]);
  return (
    <Modal open={open} onClose={onCancel} title="Rename screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSave(value.trim());
        }}
      >
        <label className="field-label" htmlFor="rename-input">
          Screen name
        </label>
        <input id="rename-input" className="input" value={value} onChange={(e) => setValue(e.target.value)} autoFocus maxLength={80} />
        <div className="modal-foot modal-foot-inline">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

const SHORTCUTS: [string, string][] = [
  ['← →', 'Previous or next screen'],
  ['1 to 9', 'Jump to screen'],
  ['P', 'Pin mode: click to log an issue'],
  ['M', 'Measure tap target'],
  ['I', 'Pick colors for contrast'],
  ['Esc', 'Back to view mode, close panels'],
  ['C', 'Switch slider or side by side'],
  ['+  −  0', 'Zoom in, zoom out, fit'],
  ['D', 'Mark screen as done'],
  ['?', 'Show this list'],
  ['Pin mode: arrows, Enter', 'Move the crosshair and drop a pin without a mouse'],
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <table className="shortcuts">
        <tbody>
          {SHORTCUTS.map(([k, d]) => (
            <tr key={k}>
              <th scope="row">
                <kbd>{k}</kbd>
              </th>
              <td>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="About inclusive design" wide>
      <p>
        Disability is a mismatch between a person and their surroundings. The same need can be permanent, temporary or
        situational. Designing for the permanent case helps many more people.
      </p>
      <table className="spectrum-table">
        <thead>
          <tr>
            <th scope="col">Ability</th>
            <th scope="col">Permanent</th>
            <th scope="col">Temporary</th>
            <th scope="col">Situational</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Vision</th>
            <td>Color blind, low vision</td>
            <td>Eye infection</td>
            <td>Bright sunlight</td>
          </tr>
          <tr>
            <th scope="row">Motor</th>
            <td>One arm</td>
            <td>Wrist fracture</td>
            <td>Holding a baby</td>
          </tr>
          <tr>
            <th scope="row">Hearing</th>
            <td>Deaf</td>
            <td>Ear infection</td>
            <td>Noisy train</td>
          </tr>
        </tbody>
      </table>
      <h3>Three principles</h3>
      <ol>
        <li>
          <strong>Recognize exclusion.</strong> Find who the screen leaves out.
        </li>
        <li>
          <strong>Solve for one, extend to many.</strong> A fix for one person helps the whole spectrum.
        </li>
        <li>
          <strong>Learn from diversity.</strong> People adapt in ways designers do not expect.
        </li>
      </ol>
      <p className="muted">
        Inspired by the Microsoft Inclusive Design toolkit. Simulations are approximations meant to build empathy and catch
        issues early. They do not replace testing with disabled people.
      </p>
    </Modal>
  );
}
