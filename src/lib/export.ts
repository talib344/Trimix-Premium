// Canvas-based export helpers. We render the media (photo or video frame) with
// filters + text + stickers onto an offscreen canvas and return a data URL.
import type { StickerOverlay, TextOverlay } from './types';
import { adjustCss, filterCss } from './filters';

const FONTS_READY = ['Poppins', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic'];
async function ensureFonts(): Promise<void> {
  if (!('fonts' in document)) return;
  try {
    await Promise.all(
      FONTS_READY.map((f) =>
        (document as any).fonts.load(`16px "${f}"`).catch(() => {}),
      ),
    );
    await (document as any).fonts.ready;
  } catch {
    /* fonts optional */
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  o: TextOverlay,
  cw: number,
  ch: number,
) {
  const fs = (o.fontSize / 100) * Math.min(cw, ch);
  ctx.font = `${o.fontWeight} ${fs}px ${o.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color;
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = fs * 0.12;
  ctx.shadowOffsetY = fs * 0.04;
  const x = o.x * cw;
  const y = o.y * ch;
  if (o.isUrdu) {
    ctx.direction = 'rtl';
  }
  // manual wrap
  const maxW = cw * 0.9;
  const words = o.text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const lh = fs * 1.25;
  const startY = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lh));
  ctx.direction = 'ltr';
  ctx.shadowColor = 'transparent';
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  s: StickerOverlay,
  cw: number,
  ch: number,
) {
  const fs = (s.size / 100) * Math.min(cw, ch);
  ctx.font = `${fs}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.emoji, s.x * cw, s.y * ch);
}

function composeFilterCss(filterKey: string, extra: Record<string, number | undefined>): string {
  const base = filterCss(filterKey);
  const adj = adjustCss({
    brightness: extra.brightness,
    contrast: extra.contrast,
    saturation: extra.saturation,
    blur: extra.blur,
  });
  if (base === 'none') return adj === 'none' ? 'none' : adj;
  if (adj === 'none') return base;
  return `${base} ${adj}`;
}

async function loadImage(src: string, crossOrigin = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load (CORS or network).'));
    img.src = src;
  });
}

export interface PhotoExportOptions {
  src: string;
  filter: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness?: number;
  blur: number;
  vignette: number;
  rotate: number;
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  maxDim?: number;
}

export async function exportPhotoCanvas(
  opts: PhotoExportOptions,
): Promise<string> {
  await ensureFonts();
  const img = await loadImage(opts.src);
  const maxDim = opts.maxDim ?? 1080;
  let w = img.width;
  let h = img.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  // account for rotation
  const rotated = opts.rotate % 180 !== 0;
  canvas.width = rotated ? h : w;
  canvas.height = rotated ? w : h;
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((opts.rotate * Math.PI) / 180);
  ctx.filter = composeFilterCss(opts.filter, {
    brightness: opts.brightness,
    contrast: opts.contrast,
    saturation: opts.saturation,
    blur: opts.blur,
  });
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.filter = 'none';

  if (opts.vignette > 0) {
    const grd = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.3,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.75,
    );
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, `rgba(0,0,0,${Math.min(opts.vignette, 0.9).toFixed(2)})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (const t of opts.textOverlays) drawText(ctx, t, canvas.width, canvas.height);
  for (const s of opts.stickers) drawSticker(ctx, s, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/** Capture the current video frame + overlays into a poster image (data URL). */
export async function captureVideoFrame(
  video: HTMLVideoElement,
  opts: {
    filter: string;
    textOverlays: TextOverlay[];
    stickers: StickerOverlay[];
    aspect: '9:16' | '1:1' | '16:9';
  },
): Promise<string> {
  await ensureFonts();
  const dims = { '9:16': [1080, 1920], '1:1': [1080, 1080], '16:9': [1920, 1080] }[opts.aspect];
  const [cw, ch] = dims;
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  ctx.filter = filterCss(opts.filter) === 'none' ? 'none' : filterCss(opts.filter);

  // cover-fit video into target aspect
  const vw = video.videoWidth || cw;
  const vh = video.videoHeight || ch;
  const scale = Math.max(cw / vw, ch / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.drawImage(video, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  ctx.filter = 'none';

  for (const t of opts.textOverlays) drawText(ctx, t, cw, ch);
  for (const s of opts.stickers) drawSticker(ctx, s, cw, ch);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/** Trigger a download for a data URL or remote URL. */
export function downloadUrl(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Convert a data URL to a Blob for sharing via Web Share API. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
