import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, MoreVertical, MoveLeft, MoveRight, Pencil, Trash2 } from 'lucide-react';
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
  const [menu, setMenu] = useState<{ id: string; left: number; bottom: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = (refocus = false) => {
    setMenu(null);
    if (refocus) triggerRef.current?.focus();
  };

  const openMenu = (id: string, btn: HTMLButtonElement) => {
    if (menu?.id === id) return closeMenu();
    triggerRef.current = btn;
    const r = btn.getBoundingClientRect();
    // Fixed position so the horizontally scrolling list does not clip it; opens upward from the trigger
    setMenu({ id, left: Math.max(8, Math.min(r.left, window.innerWidth - 188)), bottom: window.innerHeight - r.top + 4 });
  };

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) closeMenu();
    };
    const onLeave = () => closeMenu();
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', onLeave);
    window.addEventListener('scroll', onLeave, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onLeave);
      window.removeEventListener('scroll', onLeave, true);
    };
  }, [menu]);

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => items[(i + items.length) % items.length]?.focus();
    // Keep app-wide shortcuts (P, M, 1-9...) from firing while the menu is open
    e.stopPropagation();
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      closeMenu(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      go(at + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      go(at - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(items.length - 1);
    }
  };

  const menuIdx = menu ? screens.findIndex((s) => s.id === menu.id) : -1;
  const menuScreen = screens[menuIdx];
  const act = (fn: () => void) => {
    closeMenu(true);
    fn();
  };

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
            className={`film-item${s.id === activeId ? ' is-active' : ''}${overIdx === i && dragId ? ' is-over' : ''}${menu?.id === s.id ? ' menu-open' : ''}`}
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
            <button
              className="film-more"
              onClick={(e) => openMenu(s.id, e.currentTarget)}
              aria-label={`More actions for ${s.name}`}
              aria-haspopup="menu"
              aria-expanded={menu?.id === s.id}
            >
              <MoreVertical size={16} aria-hidden="true" />
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
      {menu && menuScreen && (
        <div
          ref={menuRef}
          className="film-menu"
          role="menu"
          aria-label={`Actions for ${menuScreen.name}`}
          style={{ left: menu.left, bottom: menu.bottom }}
          onKeyDown={onMenuKey}
        >
          <button role="menuitem" onClick={() => act(() => onRename(menuScreen.id))}>
            <Pencil size={14} aria-hidden="true" />
            Rename
          </button>
          <button role="menuitem" onClick={() => act(() => onMove(menuScreen.id, menuIdx - 1))} disabled={menuIdx <= 0}>
            <MoveLeft size={14} aria-hidden="true" />
            Move left
          </button>
          <button role="menuitem" onClick={() => act(() => onMove(menuScreen.id, menuIdx + 1))} disabled={menuIdx >= screens.length - 1}>
            <MoveRight size={14} aria-hidden="true" />
            Move right
          </button>
          <div className="film-menu-sep" role="separator" />
          <button role="menuitem" className="film-menu-danger" onClick={() => act(() => onDelete(menuScreen.id))}>
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        </div>
      )}
    </nav>
  );
}
