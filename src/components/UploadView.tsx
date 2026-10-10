import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ClipboardPaste, ImagePlus, Images, Trash2, Upload } from 'lucide-react';
import TopBar from './TopBar';
import { Note } from './ui';
import { MAX_FILES } from '../utils/image';
import type { ScreenMeta, ThemePref } from '../types';

interface Props {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  onClear: () => void;
  screens: ScreenMeta[];
  urls: Record<string, string>;
  onAdd: (files: File[]) => Promise<string[]>;
  onSamples: () => Promise<number>;
  onRemove: (id: string) => void;
  onHome: () => void;
  onStart: () => void;
}

export default function UploadView({ theme, setTheme, onClear, screens, urls, onAdd, onSamples, onRemove, onHome, onStart }: Props) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setErrors(await onAdd(files));
    setBusy(false);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
      if (files.length) {
        e.preventDefault();
        add(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });

  return (
    <div className="page">
      <TopBar
        theme={theme}
        setTheme={setTheme}
        onHome={onHome}
        actions={
          screens.length > 0 ? (
            <button className="btn btn-ghost" onClick={onClear}>
              <Trash2 size={16} aria-hidden="true" />
              Clear session
            </button>
          ) : null
        }
      />
      <main id="main" className="upload">
        <div className="upload-head">
          <h1>Add screens</h1>
          <p className="muted">
            {screens.length} of {MAX_FILES} screens · PNG, JPG or WebP · up to 10 MB each
          </p>
        </div>

        <div
          className={`dropzone${drag ? ' is-drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add(Array.from(e.dataTransfer.files));
          }}
        >
          <Upload size={32} aria-hidden="true" className="dropzone-icon" />
          <p className="dropzone-title">Drag and drop screenshots here</p>
          <p className="muted">
            <ClipboardPaste size={16} aria-hidden="true" className="inline-icon" /> or paste with Ctrl V / Cmd V
          </p>
          <div className="dropzone-actions">
            <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={busy || screens.length >= MAX_FILES}>
              <ImagePlus size={18} aria-hidden="true" />
              Choose files
            </button>
            <button
              className="btn"
              onClick={async () => {
                setBusy(true);
                await onSamples();
                setBusy(false);
              }}
              disabled={busy || screens.length >= MAX_FILES}
            >
              <Images size={18} aria-hidden="true" />
              Add sample screens
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            hidden
            onChange={(e) => {
              add(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
          {busy && (
            <p role="status" className="muted">
              Preparing images on your device…
            </p>
          )}
        </div>

        {errors.length > 0 && (
          <div className="error-list" role="alert">
            <p className="error-title">Some files were not added</p>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {screens.length > 0 ? (
          <>
            <h2 className="section-title">Screens in this session</h2>
            <ul className="thumb-grid">
              {screens.map((s, i) => (
                <li key={s.id} className="thumb-card">
                  <img src={urls[s.id]} alt="" />
                  <div className="thumb-card-meta">
                    <span className="thumb-card-name">
                      {i + 1}. {s.name}
                    </span>
                    <span className="muted small">
                      {s.width} × {s.height} px
                    </span>
                  </div>
                  <button className="icon-btn" onClick={() => onRemove(s.id)} aria-label={`Remove ${s.name}`}>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="upload-foot">
              <button className="btn btn-primary btn-lg" onClick={onStart}>
                Start review
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <Note>Tip: phone screenshots work best for the reach and tap target lenses. Desktop screens work for all vision lenses.</Note>
        )}
      </main>
    </div>
  );
}
