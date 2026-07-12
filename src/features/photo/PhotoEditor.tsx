import { useEffect, useRef, useState } from 'react';
import type {
  PexelsPhoto,
  PhotoProjectData,
  SavedProject,
  StickerOverlay,
  TextOverlay,
} from '../../lib/types';
import { uid } from '../../lib/types';
import { PHOTO_FILTERS, filterCss, vignetteStyle } from '../../lib/filters';
import { exportPhotoCanvas, downloadUrl } from '../../lib/export';
import { removeBackground } from '../../lib/bgRemove';
import { loadProjects, upsertProject } from '../../lib/projects';
import { shareMedia } from '../../lib/share';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  SectionTitle,
  Slider,
  Spinner,
} from '../../components/ui';
import { PexelsPhotoPicker } from '../../components/editors/PexelsPhotoPicker';
import { TextEditor } from '../../components/editors/TextEditor';
import { StickerPicker } from '../../components/editors/StickerPicker';
import { PexelsCredit } from '../../components/editors/PexelsCredit';
import { OverlayLayer } from '../../components/editors/OverlayLayer';

const DEFAULT_STATE: PhotoProjectData = {
  sourceUrl: '',
  sourceKind: 'gallery',
  filter: 'none',
  brightness: 1,
  contrast: 1,
  saturation: 1,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  rotate: 0,
  textOverlays: [],
  stickers: [],
};

type Tool =
  | 'crop'
  | 'filters'
  | 'adjust'
  | 'text'
  | 'stickers'
  | 'bgremove'
  | 'export';

export function PhotoEditor({
  initialProject,
  onSaved,
}: {
  initialProject: SavedProject | null;
  onSaved: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PhotoProjectData>(DEFAULT_STATE);
  const [tool, setTool] = useState<Tool | null>(null);
  const [showPexels, setShowPexels] = useState(false);
  const [editingText, setEditingText] = useState<TextOverlay | 'new' | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);

  useEffect(() => {
    if (initialProject?.type === 'photo') {
      setState({ ...DEFAULT_STATE, ...(initialProject.data as PhotoProjectData) });
    }
  }, [initialProject]);

  const patch = (p: Partial<PhotoProjectData>) => setState((s) => ({ ...s, ...p }));

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    patch({ sourceUrl: url, sourceKind: 'gallery', textOverlays: [], stickers: [] });
    setTool(null);
  }

  function pickPexels(p: PexelsPhoto) {
    patch({
      sourceUrl: p.src.large,
      sourceKind: 'pexels',
      pexelsUser: p.photographer,
      textOverlays: [],
      stickers: [],
    });
    setTool(null);
  }

  function addOrUpdateText(o: TextOverlay) {
    setState((s) => {
      const exists = s.textOverlays.some((t) => t.id === o.id);
      return {
        ...s,
        textOverlays: exists
          ? s.textOverlays.map((t) => (t.id === o.id ? o : t))
          : [...s.textOverlays, o],
      };
    });
    setEditingText(null);
  }
  function deleteText(id: string) {
    setState((s) => ({ ...s, textOverlays: s.textOverlays.filter((t) => t.id !== id) }));
    setEditingText(null);
  }

  function addSticker(emoji: string) {
    const s: StickerOverlay = { id: uid(), emoji, x: 0.5, y: 0.5, size: 14 };
    setState((st) => ({ ...st, stickers: [...st.stickers, s] }));
  }
  function deleteSticker(id: string) {
    setState((s) => ({ ...s, stickers: s.stickers.filter((x) => x.id !== id) }));
  }

  async function doRemoveBg() {
    setRemovingBg(true);
    try {
      const { dataUrl, method } = await removeBackground(state.sourceUrl);
      patch({ sourceUrl: dataUrl, sourceKind: 'gallery' });
      alert(
        method === 'model'
          ? 'Background removed with AI model.'
          : 'Background removed with chroma fallback. Best on plain backgrounds; for complex images install a model.',
      );
    } catch (e: any) {
      alert(`Background removal failed: ${e?.message || e}`);
    } finally {
      setRemovingBg(false);
    }
  }

  const filterStyle = (() => {
    const parts: string[] = [];
    const f = filterCss(state.filter);
    if (f !== 'none') parts.push(f);
    const adj = [
      `brightness(${state.brightness})`,
      `contrast(${state.contrast})`,
      `saturate(${state.saturation})`,
    ];
    parts.push(...adj);
    if (state.blur > 0) parts.push(`blur(${state.blur}px)`);
    return parts.join(' ');
  })();

  async function exportPhoto() {
    setExporting(true);
    try {
      const dataUrl = await exportPhotoCanvas({
        src: state.sourceUrl,
        filter: state.filter,
        brightness: state.brightness,
        contrast: state.contrast,
        saturation: state.saturation,
        sharpness: state.sharpness,
        blur: state.blur,
        vignette: state.vignette,
        rotate: state.rotate,
        textOverlays: state.textOverlays,
        stickers: state.stickers,
      });
      downloadUrl(dataUrl, `trimix-photo-${Date.now()}.jpg`);
      const res = await shareMedia({
        title: 'Trimix Premium Pro',
        text: 'Made with Trimix Premium Pro 👑 — Free Forever',
        dataUrl,
        filename: 'trimix-photo.jpg',
      });
      if (res === 'unsupported') alert('Photo downloaded! Share it from your gallery.');
    } catch (e: any) {
      alert(`Export failed (CORS or network). Try a gallery image. ${e?.message || e}`);
    } finally {
      setExporting(false);
    }
  }

  async function saveProject() {
    if (!state.sourceUrl) return;
    let thumb = state.sourceUrl;
    try {
      thumb = await exportPhotoCanvas({ src: state.sourceUrl, ...state, maxDim: 400 });
    } catch {
      /* keep source */
    }
    const list = loadProjects();
    upsertProject(list, {
      id: initialProject?.id,
      type: 'photo',
      name: 'Photo edit',
      thumbnail: thumb,
      data: state,
    });
    onSaved();
    alert('Project saved to Projects tab!');
  }

  if (!state.sourceUrl) {
    return (
      <div>
        <EmptyState
          icon="🖼️"
          title="Photo Editor"
          subtitle="Import a photo from your gallery or pick a free image from Pexels. 20 filters, adjustments, Urdu text, background remove, HD export."
          action={
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button size="lg" onClick={() => fileRef.current?.click()}>
                ⬆️ Import from Gallery
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowPexels(true)}>
                🖼️ Free Photos from Pexels
              </Button>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
            </div>
          }
        />
        {showPexels && <PexelsPhotoPicker onPick={pickPexels} onClose={() => setShowPexels(false)} />}
        <div className="text-center mt-2">
          <PexelsCredit />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />

      {/* Preview */}
      <Card className="p-2">
        <div className="relative mx-auto bg-black rounded-xl overflow-hidden max-w-[460px]">
          <div className="relative aspect-square">
            <img
              src={state.sourceUrl}
              alt="edit"
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full object-contain"
              style={{ filter: filterStyle, transform: `rotate(${state.rotate}deg)` }}
            />
            <div className="absolute inset-0 pointer-events-none" style={vignetteStyle(state.vignette)} />
            <OverlayLayer
              textOverlays={state.textOverlays}
              stickers={state.stickers}
              onTextDrag={(id, x, y) =>
                setState((s) => ({ ...s, textOverlays: s.textOverlays.map((t) => (t.id === id ? { ...t, x, y } : t)) }))
              }
              onStickerDrag={(id, x, y) =>
                setState((s) => ({ ...s, stickers: s.stickers.map((t) => (t.id === id ? { ...t, x, y } : t)) }))
              }
              onTextTap={(o) => setEditingText(o)}
              onStickerTap={(s) => deleteSticker(s.id)}
            />
          </div>
          {state.sourceKind === 'pexels' && (
            <div className="absolute top-2 right-2 text-[9px] bg-black/50 rounded px-1.5 py-0.5">
              by {state.pexelsUser}
            </div>
          )}
        </div>
      </Card>

      {/* Quick toolbar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {(
          [
            ['crop', '🔄 Rotate'],
            ['filters', '🎨 Filters'],
            ['adjust', '🎚️ Adjust'],
            ['text', '🅰️ Text'],
            ['stickers', '😀 Stickers'],
            ['bgremove', '✂️ BG Remove'],
            ['export', '📤 Export'],
          ] as [Tool, string][]
        ).map(([k, label]) => (
          <Chip key={k} active={tool === k} onClick={() => setTool(tool === k ? null : k)}>
            {label}
          </Chip>
        ))}
      </div>

      {tool === 'crop' && (
        <Card>
          <SectionTitle icon="🔄" title="Rotate & Resize" />
          <Slider label="Rotation" value={state.rotate} min={-180} max={180} step={1} suffix="°" onChange={(v) => patch({ rotate: v })} />
          <div className="flex gap-2">
            {[0, 90, 180, 270].map((r) => (
              <Chip key={r} active={state.rotate === r} onClick={() => patch({ rotate: r })}>
                {r}°
              </Chip>
            ))}
            <Button size="sm" variant="subtle" onClick={() => patch({ rotate: 0 })}>
              Reset
            </Button>
          </div>
        </Card>
      )}

      {tool === 'filters' && (
        <Card>
          <SectionTitle icon="🎨" title="Filters" hint={`${PHOTO_FILTERS.length} presets`} />
          <div className="grid grid-cols-4 gap-2">
            {PHOTO_FILTERS.map((f) => (
              <button key={f.key} onClick={() => patch({ filter: f.key })} className="text-center">
                <div
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                    state.filter === f.key ? 'border-brand-400' : 'border-white/10'
                  }`}
                >
                  <img
                    src={state.sourceUrl}
                    alt={f.label}
                    className="h-full w-full object-cover"
                    style={{ filter: f.css }}
                  />
                </div>
                <span className={`text-[10px] mt-1 block ${state.filter === f.key ? 'text-brand-300' : 'text-white/50'}`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {tool === 'adjust' && (
        <Card>
          <SectionTitle icon="🎚️" title="Adjust" />
          <Slider label="Brightness" value={state.brightness} min={0.4} max={1.6} step={0.01} onChange={(v) => patch({ brightness: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Contrast" value={state.contrast} min={0.4} max={1.6} step={0.01} onChange={(v) => patch({ contrast: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Saturation" value={state.saturation} min={0} max={2} step={0.01} onChange={(v) => patch({ saturation: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Sharpness" value={state.sharpness} min={0} max={100} step={1} suffix="%" onChange={(v) => patch({ sharpness: v })} />
          <Slider label="Blur" value={state.blur} min={0} max={12} step={0.5} suffix="px" onChange={(v) => patch({ blur: v })} />
          <Slider label="Vignette" value={state.vignette} min={0} max={1} step={0.05} onChange={(v) => patch({ vignette: v })} format={(v) => `${Math.round(v * 100)}%`} />
          <Button size="sm" variant="subtle" onClick={() => patch({ brightness: 1, contrast: 1, saturation: 1, sharpness: 0, blur: 0, vignette: 0 })}>
            Reset all
          </Button>
        </Card>
      )}

      {tool === 'text' && (
        <Card>
          <SectionTitle
            icon="🅰️"
            title="Text on Photo"
            right={<Button size="sm" onClick={() => setEditingText('new')}>+ Add</Button>}
          />
          <div className="space-y-2">
            {state.textOverlays.length === 0 && (
              <p className="text-xs text-white/40 py-2">No text yet. Add Urdu or English text.</p>
            )}
            {state.textOverlays.map((t) => (
              <button
                key={t.id}
                onClick={() => setEditingText(t)}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <p className={`text-sm truncate ${t.isUrdu ? 'urdu' : ''}`} dir={t.isUrdu ? 'rtl' : 'ltr'}>
                  {t.text}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {tool === 'stickers' && (
        <Card>
          <SectionTitle
            icon="😀"
            title="Stickers"
            right={<Button size="sm" onClick={() => setShowStickers(true)}>+ Add</Button>}
          />
          <div className="flex flex-wrap gap-2">
            {state.stickers.map((s) => (
              <button
                key={s.id}
                onClick={() => deleteSticker(s.id)}
                className="h-10 w-10 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 text-xl flex items-center justify-center"
              >
                {s.emoji}
              </button>
            ))}
            {state.stickers.length === 0 && (
              <p className="text-xs text-white/40 py-2">Tap a sticker on the preview to remove it.</p>
            )}
          </div>
        </Card>
      )}

      {tool === 'bgremove' && (
        <Card>
          <SectionTitle icon="✂️" title="Background Remove" />
          <p className="text-xs text-white/50 mb-3">
            Removes the background using a free AI model (runs in your browser). Works best with clear subjects.
          </p>
          <Button onClick={doRemoveBg} disabled={removingBg} className="w-full">
            {removingBg ? (
              <>
                <Spinner className="h-4 w-4" /> Removing…
              </>
            ) : (
              '✂️ Remove background'
            )}
          </Button>
          <p className="text-[10px] text-white/40 mt-2">
            Note: first run downloads a model (~40MB) and may take a few seconds.
          </p>
        </Card>
      )}

      {tool === 'export' && (
        <Card>
          <SectionTitle icon="📤" title="Export HD & Share" />
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportPhoto} disabled={exporting}>
              {exporting ? <Spinner className="h-4 w-4" /> : '📥 Export HD'}
            </Button>
            <Button variant="outline" onClick={saveProject}>
              💾 Save project
            </Button>
          </div>
          <p className="text-[10px] text-white/40 mt-3">
            Exports at up to 1080p HD, no watermark. Then share to TikTok, YouTube, or Instagram.
          </p>
          <div className="mt-2 text-center">
            <PexelsCredit />
          </div>
        </Card>
      )}

      {/* Modals */}
      {showPexels && <PexelsPhotoPicker onPick={pickPexels} onClose={() => setShowPexels(false)} />}
      {showStickers && <StickerPicker onPick={addSticker} onClose={() => setShowStickers(false)} />}
      {editingText && (
        <TextEditor
          overlay={editingText === 'new' ? undefined : editingText}
          onSave={addOrUpdateText}
          onClose={() => setEditingText(null)}
          onDelete={deleteText}
        />
      )}
    </div>
  );
}
