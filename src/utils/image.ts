export const MAX_FILES = 20;
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_EDGE = 2400;
export const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export interface Processed {
  blob: Blob;
  width: number;
  height: number;
  scale: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this image'));
    img.src = src;
  });
}

/** Guess how many image pixels make one CSS pixel, from the original size. */
export function guessScale(w: number, h: number): number {
  const portrait = h > w;
  if (portrait && w >= 1000) return 3;
  if (portrait && w >= 640) return 2;
  if (!portrait && w >= 2400) return 2;
  return 1;
}

async function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), type, 0.92),
  );
}

/** Resize to MAX_EDGE on the long side and keep the format. Runs fully on the device. */
export async function processFile(file: Blob): Promise<Processed> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const w0 = img.naturalWidth;
    const h0 = img.naturalHeight;
    const ratio = Math.min(1, MAX_EDGE / Math.max(w0, h0));
    const scale0 = guessScale(w0, h0);
    if (ratio === 1) return { blob: file, width: w0, height: h0, scale: scale0 };
    const w = Math.round(w0 * ratio);
    const h = Math.round(h0 * ratio);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    const type = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
    return { blob: await toBlob(c, type), width: w, height: h, scale: Math.max(0.25, scale0 * ratio) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Rasterize an SVG string to a PNG blob (used for the bundled sample screens). */
export async function svgToPng(svg: string, width: number): Promise<Processed> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = await loadImage(url);
    const ratio = width / img.naturalWidth;
    const c = document.createElement('canvas');
    c.width = width;
    c.height = Math.round(img.naturalHeight * ratio);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return { blob: await toBlob(c, 'image/png'), width: c.width, height: c.height, scale: ratio };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Pixel reader for the eyedropper, cached per image URL. */
const pixelCache = new Map<string, Promise<CanvasRenderingContext2D>>();
export function getPixelContext(url: string): Promise<CanvasRenderingContext2D> {
  let p = pixelCache.get(url);
  if (!p) {
    p = loadImage(url).then((img) => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      return ctx;
    });
    pixelCache.set(url, p);
  }
  return p;
}
