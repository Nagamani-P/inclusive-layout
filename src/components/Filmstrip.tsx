import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, MoveLeft, MoveRight, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from './ui';
import type { ScreenMeta } from '../types';

interface Props {
  screens: ScreenMeta[];
  urls: Record<string, string>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, to: number) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function Filmstrip({ screens, urls, activeId, onSelect, onMove, onRename, onDelete, onAdd }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const idx = screens.findIndex((s) => s.id === activeId);
  const active = screens[idx];
  const done = screens.filter((s) => s.status === 'done').length;

  return (
    <nav className="filmstrip" aria-label="Screens">
      <div className="filmstrip-bar">
        <button className="icon-btn" onClick={() => idx > 0 && onSelect(screens[idx - 1].id)} disabled={idx <= 0} aria-label="Previous screen">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <span className="filmstrip-count">
          Screen {idx + 1} of {screens.length} · {done} done
        </span>
        <button
          className="icon-btn"
          onClick={() => idx < screens.length - 1 && onSelect(screens[idx + 1].id)}
          disabled={idx >= screens.length - 1}
          aria-label="Next screen"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
        {active && (
          <div className="filmstrip-actions" aria-label={`Actions for ${active.name}`} role="group">
            <button className="btn btn-ghost btn-sm" onClick={() => onRename(active.id)}>
              <Pencil size={14} aria-hidden="true" />
              Rename
            </button>
            <button className="icon-btn icon-btn-sm" onClick={() => onMove(active.id, idx - 1)} disabled={idx <= 0} aria-label="Move screen left">
              <MoveLeft size={16} aria-hidden="true" />
            </button>
            <button className="icon-btn icon-btn-sm" onClick={() => onMove(active.id, idx + 1)} disabled={idx >= screens.length - 1} aria-label="Move screen right">
              <MoveRight size={16} aria-hidden="true" />
            </button>
            <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => onDelete(active.id)}>
              <Trash2 size={14} aria-hidden="true" />
              Remove
            </button>
          </div>
        )}
      </div>
      <ol className="filmstrip-list">
        {screens.map((s, i) => (
          <li
            key={s.id}
            className={`film-item${s.id === activeId ? ' is-active' : ''}${overIdx === i && dragId ? ' is-over' : ''}`}
            draggable
            onDragStart={(e) => {
              setDragId(s.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIdx(i);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverIdx(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) onMove(dragId, i);
              setDragId(null);
              setOverIdx(null);
            }}
          >
            <button className="film-btn" onClick={() => onSelect(s.id)} aria-current={s.id === activeId ? 'true' : undefined}>
              <span className="film-thumb">
                <img src={urls[s.id]} alt="" draggable={false} />
                <span className="film-num" aria-hidden="true">
                  {i + 1}
                </span>
                {s.issues.length > 0 && (
                  <span className="film-issues" aria-hidden="true">
                    {s.issues.length}
                  </span>
                )}
              </span>
              <span className="film-name">{s.name}</span>
              <StatusBadge status={s.status} compact />
              <span className="sr-only">
                , {s.issues.length} issue{s.issues.length === 1 ? '' : 's'}
              </span>
            </button>
          </li>
        ))}
        {screens.length < 20 && (
          <li className="film-item film-add">
            <button className="film-btn" onClick={onAdd}>
              <span className="film-thumb film-thumb-add">
                <ImagePlus size={22} aria-hidden="true" />
              </span>
              <span className="film-name">Add screens</span>
            </button>
          </li>
        )}
      </ol>
    </nav>
  );
}
