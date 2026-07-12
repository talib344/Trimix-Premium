import { useState } from 'react';
import type { TextOverlay } from '../../lib/types';
import { uid } from '../../lib/types';
import { FONT_FAMILIES, COLOR_SWATCHES } from '../../lib/constants';
import { Button, Toggle } from '../ui';

export function TextEditor({
  overlay,
  onSave,
  onClose,
  onDelete,
}: {
  overlay?: TextOverlay;
  onSave: (o: TextOverlay) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const [text, setText] = useState(overlay?.text ?? '');
  const [isUrdu, setIsUrdu] = useState(overlay?.isUrdu ?? false);
  const [color, setColor] = useState(overlay?.color ?? '#ffffff');
  const [fontSize, setFontSize] = useState(overlay?.fontSize ?? 8);
  const [fontWeight, setFontWeight] = useState(overlay?.fontWeight ?? 600);
  const [fontFamily, setFontFamily] = useState(
    overlay?.fontFamily ?? (isUrdu ? '"Noto Nastaliq Urdu", serif' : 'Poppins, sans-serif'),
  );

  function save() {
    if (!text.trim()) return;
    onSave({
      id: overlay?.id ?? uid(),
      text: text.trim(),
      x: overlay?.x ?? 0.5,
      y: overlay?.y ?? 0.5,
      fontSize,
      color,
      isUrdu,
      fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : fontFamily,
      fontWeight,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="glass rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{overlay ? 'Edit Text' : 'Add Text'}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={isUrdu ? 'یہاں Urdu میں لکھیں…' : 'Type your text…'}
          className={`w-full bg-ink-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 ${
            isUrdu ? 'urdu' : ''
          }`}
          dir={isUrdu ? 'rtl' : 'ltr'}
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-white/70">Urdu text</span>
          <Toggle
            checked={isUrdu}
            onChange={(v) => {
              setIsUrdu(v);
              if (v) setFontFamily('"Noto Nastaliq Urdu", serif');
            }}
          />
        </div>

        {!isUrdu && (
          <div className="mt-3">
            <label className="text-xs text-white/70 block mb-1.5">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-ink-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm"
            >
              {FONT_FAMILIES.filter((f) => !f.urdu).map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-3">
          <label className="text-xs text-white/70 block mb-1.5">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  color === c ? 'border-white scale-110' : 'border-white/20'
                }`}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-7 rounded-full bg-transparent border-2 border-white/20 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/70 block mb-1.5">Size</label>
            <input
              type="range"
              min={4}
              max={20}
              step={0.5}
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1.5">Weight</label>
            <select
              value={fontWeight}
              onChange={(e) => setFontWeight(parseInt(e.target.value))}
              className="w-full bg-ink-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm"
            >
              <option value={300}>Light</option>
              <option value={400}>Regular</option>
              <option value={600}>Semibold</option>
              <option value={700}>Bold</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {overlay && onDelete && (
            <Button variant="danger" onClick={() => onDelete(overlay.id)}>
              Delete
            </Button>
          )}
          <Button variant="subtle" onClick={onClose} className="ml-auto">
            Cancel
          </Button>
          <Button onClick={save} disabled={!text.trim()}>
            {overlay ? 'Save' : 'Add'}
          </Button>
        </div>
        <p className="mt-3 text-[10px] text-white/40 text-center">
          Tip: drag the text on the preview to reposition it.
        </p>
      </div>
    </div>
  );
}
