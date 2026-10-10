import { openDB, type IDBPDatabase } from 'idb';
import type { ScreenMeta } from '../types';

/**
 * Session storage in IndexedDB. Everything stays in this browser.
 * Every call is wrapped so the app still works when storage is blocked
 * (private windows, strict settings).
 */
let dbPromise: Promise<IDBPDatabase> | null = null;

function db() {
  if (!dbPromise) {
    dbPromise = openDB('inclusive-layout', 1, {
      upgrade(d) {
        d.createObjectStore('blobs');
        d.createObjectStore('meta');
      },
    });
  }
  return dbPromise;
}

export async function saveBlob(id: string, blob: Blob) {
  try {
    await (await db()).put('blobs', blob, id);
  } catch {
    /* storage unavailable */
  }
}

export async function deleteBlob(id: string) {
  try {
    await (await db()).delete('blobs', id);
  } catch {
    /* ignore */
  }
}

export async function saveScreens(screens: ScreenMeta[]) {
  try {
    await (await db()).put('meta', screens, 'screens');
  } catch {
    /* ignore */
  }
}

export async function loadSession(): Promise<{ screens: ScreenMeta[]; blobs: Record<string, Blob> }> {
  try {
    const d = await db();
    const screens = ((await d.get('meta', 'screens')) as ScreenMeta[] | undefined) ?? [];
    const blobs: Record<string, Blob> = {};
    for (const s of screens) {
      const b = (await d.get('blobs', s.id)) as Blob | undefined;
      if (b) blobs[s.id] = b;
    }
    return { screens: screens.filter((s) => blobs[s.id]), blobs };
  } catch {
    return { screens: [], blobs: {} };
  }
}

export async function clearSession() {
  try {
    const d = await db();
    await d.clear('blobs');
    await d.clear('meta');
  } catch {
    /* ignore */
  }
}
