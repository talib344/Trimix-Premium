// Background removal using a free, in-browser approach. We try, in order:
// 1) @imgly/background-removal (wasm, no API key) — if available
// 2) A luminance-based chroma fallback (works best on plain backgrounds)
// Because external wasm models are heavy, we ship a lightweight canvas fallback.

interface BgRemovalResult {
  dataUrl: string;
  method: 'model' | 'fallback';
}

export async function removeBackground(src: string): Promise<BgRemovalResult> {
  // Try dynamic import of the optional wasm model
  try {
    const mod = await import('@imgly/background-removal').catch(() => null);
    if (mod?.removeBackground) {
      const blob = await mod.removeBackground(src);
      const dataUrl = await blobToDataUrl(blob);
      return { dataUrl, method: 'model' };
    }
  } catch {
    /* fall through */
  }
  return chromaFallback(src);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Failed to read blob.'));
    r.readAsDataURL(blob);
  });
}

async function chromaFallback(src: string): Promise<BgRemovalResult> {
  const img = await loadImage(src);
  const maxDim = 1080;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Sample the 4 corners to estimate the background color
  const idx = (x: number, y: number) => (y * w + x) * 4;
  const corners = [
    idx(0, 0),
    idx(w - 1, 0),
    idx(0, h - 1),
    idx(w - 1, h - 1),
  ];
  let r = 0, g = 0, b = 0;
  for (const i of corners) {
    r += px[i]; g += px[i + 1]; b += px[i + 2];
  }
  r /= corners.length;
  g /= corners.length;
  b /= corners.length;

  const threshold = 48; // color distance
  const softEdge = 18;
  for (let i = 0; i < px.length; i += 4) {
    const dr = px[i] - r;
    const dg = px[i + 1] - g;
    const db = px[i + 2] - b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < threshold) {
      px[i + 3] = 0;
    } else if (dist < threshold + softEdge) {
      px[i + 3] = Math.round(((dist - threshold) / softEdge) * 255);
    }
  }
  ctx.putImageData(data, 0, 0);
  return { dataUrl: canvas.toDataURL('image/png'), method: 'fallback' };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load.'));
    img.src = src;
  });
}
