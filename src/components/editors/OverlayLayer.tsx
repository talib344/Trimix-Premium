import type { TextOverlay, StickerOverlay } from '../../lib/types';

interface OverlayLayerProps {
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  /** reference container size for fontSize scaling (px base) */
  onTextDrag: (id: string, x: number, y: number) => void;
  onStickerDrag: (id: string, x: number, y: number) => void;
  onTextTap?: (o: TextOverlay) => void;
  onStickerTap?: (s: StickerOverlay) => void;
}

/** Absolutely-positioned, draggable overlays rendered above media. */
export function OverlayLayer({
  textOverlays,
  stickers,
  onTextDrag,
  onStickerDrag,
  onTextTap,
  onStickerTap,
}: OverlayLayerProps) {
  function startDrag(
    e: React.PointerEvent,
    id: string,
    kind: 'text' | 'sticker',
  ) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const parent = target.parentElement!.getBoundingClientRect();
    let lastX = e.clientX;
    let lastY = e.clientY;

    function move(ev: PointerEvent) {
      const dx = (ev.clientX - lastX) / parent.width;
      const dy = (ev.clientY - lastY) / parent.height;
      lastX = ev.clientX;
      lastY = ev.clientY;
      const node = target as HTMLElement;
      const curX = parseFloat(node.dataset.x ?? '0.5');
      const curY = parseFloat(node.dataset.y ?? '0.5');
      const nx = Math.min(1, Math.max(0, curX + dx));
      const ny = Math.min(1, Math.max(0, curY + dy));
      node.dataset.x = String(nx);
      node.dataset.y = String(ny);
      if (kind === 'text') onTextDrag(id, nx, ny);
      else onStickerDrag(id, nx, ny);
    }
    function up(ev: PointerEvent) {
      target.releasePointerCapture?.(ev.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {textOverlays.map((o) => (
        <div
          key={o.id}
          data-x={o.x}
          data-y={o.y}
          onPointerDown={(e) => {
            if (e.detail === 0) return;
            startDrag(e, o.id, 'text');
          }}
          onClick={() => onTextTap?.(o)}
          className="absolute pointer-events-auto cursor-move select-none touch-none text-center"
          style={{
            left: `${o.x * 100}%`,
            top: `${o.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            maxWidth: '90%',
          }}
        >
          <span
            className={o.isUrdu ? 'urdu' : ''}
            style={{
              fontFamily: o.fontFamily,
              fontWeight: o.fontWeight,
              color: o.color,
              fontSize: `${o.fontSize}cqw`,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              lineHeight: 1.2,
              whiteSpace: 'pre-wrap',
            }}
          >
            {o.text}
          </span>
        </div>
      ))}
      {stickers.map((s) => (
        <div
          key={s.id}
          data-x={s.x}
          data-y={s.y}
          onPointerDown={(e) => startDrag(e, s.id, 'sticker')}
          onClick={() => onStickerTap?.(s)}
          className="absolute pointer-events-auto cursor-move select-none touch-none"
          style={{
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${s.size}cqw`,
            lineHeight: 1,
          }}
        >
          {s.emoji}
        </div>
      ))}
    </div>
  );
}
