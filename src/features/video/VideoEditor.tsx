import { useEffect, useRef, useState } from 'react';
import type {
  CaptionCue,
  PexelsVideo,
  SavedProject,
  StickerOverlay,
  TextOverlay,
  VideoProjectData,
} from '../../lib/types';
import { uid } from '../../lib/types';
import { VIDEO_FILTERS, filterCss } from '../../lib/filters';
import { ASPECT_PRESETS } from '../../lib/constants';
import { captureVideoFrame, downloadUrl } from '../../lib/export';
import { sttAvailable, createRecognition } from '../../lib/speech';
import { loadProjects, upsertProject } from '../../lib/projects';
import { shareMedia } from '../../lib/share';
import { Button, Card, Chip, EmptyState, SectionTitle, Slider, Spinner, Toggle } from '../../components/ui';
import { PexelsVideoPicker } from '../../components/editors/PexelsVideoPicker';
import { TextEditor } from '../../components/editors/TextEditor';
import { StickerPicker } from '../../components/editors/StickerPicker';
import { MusicPicker } from '../../components/editors/MusicPicker';
import { PexelsCredit } from '../../components/editors/PexelsCredit';
import { OverlayLayer } from '../../components/editors/OverlayLayer';

const DEFAULT_STATE: VideoProjectData = {
  sourceUrl: '',
  sourceKind: 'gallery',
  poster: '',
  trimStart: 0,
  trimEnd: 0,
  speed: 1,
  filter: 'none',
  blur: 0,
  volume: 1,
  muted: false,
  textOverlays: [],
  stickers: [],
  musicTrack: undefined,
  musicVolume: 0.6,
  captions: [],
  aspect: '9:16',
};

type Tool = 'trim' | 'text' | 'music' | 'stickers' | 'captions' | 'filters' | 'speed' | 'export';

export function VideoEditor({
  initialProject,
  onSaved,
}: {
  initialProject: SavedProject | null;
  onSaved: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<VideoProjectData>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [showPexels, setShowPexels] = useState(false);
  const [editingText, setEditingText] = useState<TextOverlay | 'new' | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [captioning, setCaptioning] = useState(false);
  const [interim, setInterim] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const recRef = useRef<any>(null);

  // Load from project
  useEffect(() => {
    if (initialProject?.type === 'video') {
      setState({ ...DEFAULT_STATE, ...(initialProject.data as VideoProjectData) });
    }
  }, [initialProject]);

  const patch = (p: Partial<VideoProjectData>) => setState((s) => ({ ...s, ...p }));

  // Video element sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = state.speed;
    v.volume = state.muted ? 0 : state.volume;
  }, [state.speed, state.volume, state.muted]);

  // Music sync
  useEffect(() => {
    const m = musicRef.current;
    if (!m) return;
    m.volume = state.musicVolume;
  }, [state.musicVolume]);

  function onLoadedMeta() {
    const v = videoRef.current;
    if (!v) return;
    setReady(true);
    if (state.trimEnd === 0) patch({ trimEnd: v.duration });
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    // Apply trim window
    if (v.currentTime < state.trimStart) v.currentTime = state.trimStart;
    if (state.trimEnd > 0 && v.currentTime >= state.trimEnd) v.currentTime = state.trimStart;
    if (playing) {
      v.pause();
      musicRef.current?.pause();
    } else {
      void v.play().catch(() => {});
      if (state.musicTrack) void musicRef.current?.play().catch(() => {});
    }
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrentTime(v.currentTime);
      if (state.trimEnd > 0 && v.currentTime >= state.trimEnd) {
        v.pause();
        v.currentTime = state.trimStart;
        musicRef.current?.pause();
      }
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
    };
  }, [state.trimStart, state.trimEnd]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    patch({
      sourceUrl: url,
      sourceKind: 'gallery',
      poster: '',
      trimStart: 0,
      trimEnd: 0,
      textOverlays: [],
      stickers: [],
      captions: [],
    });
    setReady(false);
    setTool(null);
  }

  function pickPexels(v: PexelsVideo) {
    patch({
      sourceUrl: v.videoUrl,
      sourceKind: 'pexels',
      poster: v.image,
      trimStart: 0,
      trimEnd: v.duration,
      pexelsUser: v.user,
      textOverlays: [],
      stickers: [],
      captions: [],
    });
    setReady(false);
    setTool(null);
  }

  // ---- Text overlays ----
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

  // ---- Stickers ----
  function addSticker(emoji: string) {
    const s: StickerOverlay = { id: uid(), emoji, x: 0.5, y: 0.5, size: 12 };
    setState((st) => ({ ...st, stickers: [...st.stickers, s] }));
  }
  function deleteSticker(id: string) {
    setState((s) => ({ ...s, stickers: s.stickers.filter((x) => x.id !== id) }));
  }

  // ---- Captions via Web Speech API ----
  async function startCaptioning() {
    if (!sttAvailable()) {
      alert('Auto captions need the Web Speech API. Try Chrome on desktop or Android.');
      return;
    }
    setCaptioning(true);
    setTool('captions');
    const v = videoRef.current;
    v?.play().catch(() => {});
    const rec = createRecognition(
      {
        onResult: (text, isFinal) => {
          setInterim(text);
          if (isFinal) {
            const t = videoRef.current?.currentTime ?? 0;
            setState((s) => {
              const cue: CaptionCue = { id: uid(), text: text.trim(), start: t, end: t + 3 };
              return { ...s, captions: [...s.captions, cue] };
            });
            setInterim('');
          }
        },
        onEnd: () => setCaptioning(false),
        onError: (err) => {
          setCaptioning(false);
          alert(`Caption error: ${err}`);
        },
      },
      'en-US',
    );
    recRef.current = rec;
    rec?.start();
  }
  function stopCaptioning() {
    recRef.current?.stop();
    setCaptioning(false);
    setInterim('');
    videoRef.current?.pause();
  }

  // ---- Export ----
  async function exportFrame() {
    const v = videoRef.current;
    if (!v) return;
    setExporting(true);
    try {
      v.pause();
      const dataUrl = await captureVideoFrame(v, {
        filter: state.filter,
        textOverlays: state.textOverlays,
        stickers: state.stickers,
        aspect: state.aspect,
      });
      downloadUrl(dataUrl, `trimix-video-${Date.now()}.jpg`);
      const res = await shareMedia({
        title: 'Trimix Premium Pro',
        text: 'Made with Trimix Premium Pro 👑 — Free Forever',
        dataUrl,
        filename: 'trimix-export.jpg',
      });
      if (res === 'unsupported') alert('Copied to clipboard. Paste into your favorite app!');
    } catch (e: any) {
      alert(`Export failed: ${e?.message || e}`);
    } finally {
      setExporting(false);
    }
  }

  async function saveProject() {
    if (!state.sourceUrl) return;
    const thumb = videoRef.current
      ? await captureVideoFrame(videoRef.current, {
          filter: state.filter,
          textOverlays: state.textOverlays,
          stickers: state.stickers,
          aspect: state.aspect,
        }).catch(() => state.poster)
      : state.poster;
    const list = loadProjects();
    upsertProject(list, {
      id: initialProject?.id,
      type: 'video',
      name: state.sourceKind === 'pexels' ? 'Pexels video reel' : 'Video edit',
      thumbnail: thumb,
      data: state,
    });
    onSaved();
    alert('Project saved to Projects tab!');
  }

  // current caption for display (re-computed each render using currentTime state)
  const currentCue =
    state.captions.find((c) => currentTime >= c.start && currentTime <= c.end) ?? null;

  const aspectClass =
    state.aspect === '9:16' ? 'aspect-[9/16] max-w-[300px]' : state.aspect === '1:1' ? 'aspect-square max-w-[420px]' : 'aspect-video w-full';

  if (!state.sourceUrl) {
    return (
      <div>
        <EmptyState
          icon="🎬"
          title="Video Editor"
          subtitle="Import a video from your gallery or pick a free clip from Pexels. No watermark, export up to 1080p."
          action={
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button size="lg" onClick={() => fileRef.current?.click()}>
                ⬆️ Import from Gallery
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowPexels(true)}>
                🎥 Free Videos from Pexels
              </Button>
              <input ref={fileRef} type="file" accept="video/*" onChange={pickFile} className="hidden" />
            </div>
          }
        />
        {showPexels && <PexelsVideoPicker onPick={pickPexels} onClose={() => setShowPexels(false)} />}
        <div className="text-center mt-2">
          <PexelsCredit />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="video/*" onChange={pickFile} className="hidden" />

      {/* Preview */}
      <Card className="p-2">
        <div className={`relative mx-auto bg-black rounded-xl overflow-hidden ${aspectClass}`}>
          <div
            className="absolute inset-0"
            style={{ backdropFilter: state.blur > 0 ? `blur(${state.blur}px)` : undefined }}
          />
          <video
            ref={videoRef}
            src={state.sourceUrl}
            poster={state.poster || undefined}
            crossOrigin="anonymous"
            playsInline
            onLoadedMetadata={onLoadedMeta}
            onClick={togglePlay}
            className="absolute inset-0 h-full w-full object-contain cursor-pointer"
            style={{
              filter:
                filterCss(state.filter) === 'none'
                  ? state.blur > 0
                    ? `blur(${state.blur}px)`
                    : undefined
                  : `${filterCss(state.filter)} blur(${state.blur}px)`,
            }}
          />
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
          {/* live captions */}
          {(currentCue || interim) && (
            <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
              <span className="inline-block bg-black/70 rounded-lg px-3 py-1.5 text-sm font-semibold text-white">
                {currentCue?.text || interim}
              </span>
            </div>
          )}
          {/* play button overlay */}
          {!playing && ready && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20"
            >
              <span className="h-14 w-14 rounded-full bg-white/90 text-black text-2xl flex items-center justify-center shadow-lg">
                ▶
              </span>
            </button>
          )}
          {state.sourceKind === 'pexels' && (
            <div className="absolute top-2 right-2 text-[9px] bg-black/50 rounded px-1.5 py-0.5">
              by {state.pexelsUser}
            </div>
          )}
        </div>
        <audio ref={musicRef} src={state.musicTrack?.url} loop preload="none" crossOrigin="anonymous" />
        {!ready && <div className="text-center py-2 text-xs text-white/40">Loading video…</div>}
      </Card>

      {/* Quick toolbar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {(
          [
            ['trim', '✂️ Trim'],
            ['text', '🅰️ Text'],
            ['music', '🎵 Music'],
            ['stickers', '😀 Stickers'],
            ['captions', '💬 Captions'],
            ['filters', '🎨 Filters'],
            ['speed', '⏩ Speed'],
            ['export', '📤 Export'],
          ] as [Tool, string][]
        ).map(([k, label]) => (
          <Chip key={k} active={tool === k} onClick={() => setTool(tool === k ? null : k)}>
            {label}
          </Chip>
        ))}
      </div>

      {/* Tool panels */}
      {tool === 'trim' && (
        <Card>
          <SectionTitle icon="✂️" title="Trim & Cut" />
          <Slider
            label="Start"
            value={state.trimStart}
            min={0}
            max={Math.max(0.1, (videoRef.current?.duration ?? 1) - 0.1)}
            step={0.1}
            suffix="s"
            onChange={(v) => {
              patch({ trimStart: v });
              if (videoRef.current) videoRef.current.currentTime = v;
            }}
          />
          <Slider
            label="End"
            value={state.trimEnd}
            min={state.trimStart + 0.1}
            max={videoRef.current?.duration ?? 1}
            step={0.1}
            suffix="s"
            onChange={(v) => patch({ trimEnd: v })}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                const v = videoRef.current!;
                const mid = (state.trimStart + state.trimEnd) / 2;
                patch({ trimStart: mid, trimEnd: state.trimEnd });
                v.currentTime = mid;
              }}
            >
              Split at playhead
            </Button>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                const v = videoRef.current!;
                patch({ trimStart: 0, trimEnd: v.duration });
              }}
            >
              Reset
            </Button>
          </div>
        </Card>
      )}

      {tool === 'text' && (
        <Card>
          <SectionTitle
            icon="🅰️"
            title="Text Overlays"
            right={
              <Button size="sm" onClick={() => setEditingText('new')}>
                + Add
              </Button>
            }
          />
          <div className="space-y-2">
            {state.textOverlays.length === 0 && (
              <p className="text-xs text-white/40 py-2">No text yet. Tap Add to insert Urdu or English text.</p>
            )}
            {state.textOverlays.map((t) => (
              <button
                key={t.id}
                onClick={() => setEditingText(t)}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                <p className={`text-sm truncate ${t.isUrdu ? 'urdu' : ''}`} dir={t.isUrdu ? 'rtl' : 'ltr'}>
                  {t.text}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {t.isUrdu ? 'Urdu' : 'English'} · {t.color}
                </p>
              </button>
            ))}
            <Button size="sm" variant="outline" className="w-full" onClick={() => setEditingText('new')}>
              + Add text overlay
            </Button>
          </div>
        </Card>
      )}

      {tool === 'music' && (
        <Card>
          <SectionTitle
            icon="🎵"
            title="Music"
            right={
              <Button size="sm" onClick={() => setShowMusic(true)}>
                + Add
              </Button>
            }
          />
          {state.musicTrack ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-sm">
                  🎵
                </span>
                <span className="text-sm flex-1 truncate">{state.musicTrack.name}</span>
                <Button size="sm" variant="danger" onClick={() => patch({ musicTrack: undefined })}>
                  Remove
                </Button>
              </div>
              <div className="mt-3">
                <Slider label="Music volume" value={state.musicVolume} min={0} max={1} step={0.05} onChange={(v) => patch({ musicVolume: v })} format={(v) => `${Math.round(v * 100)}%`} />
              </div>
            </>
          ) : (
            <p className="text-xs text-white/40 py-2">No music. Add from the free library or upload an MP3.</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/70">Mute original audio</span>
            <Toggle checked={state.muted} onChange={(v) => patch({ muted: v })} />
          </div>
          <div className="mt-3">
            <Slider label="Original volume" value={state.volume} min={0} max={1} step={0.05} onChange={(v) => patch({ volume: v })} format={(v) => `${Math.round(v * 100)}%`} />
          </div>
        </Card>
      )}

      {tool === 'stickers' && (
        <Card>
          <SectionTitle
            icon="😀"
            title="Stickers & Emojis"
            right={
              <Button size="sm" onClick={() => setShowStickers(true)}>
                + Add
              </Button>
            }
          />
          {state.stickers.length === 0 && (
            <p className="text-xs text-white/40 py-2">Tap a sticker on the preview to remove it.</p>
          )}
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
          </div>
        </Card>
      )}

      {tool === 'captions' && (
        <Card>
          <SectionTitle icon="💬" title="Auto Captions (Web Speech)" />
          <p className="text-xs text-white/50 mb-3">
            Play the video and tap Start. Your browser transcribes the audio live (Chrome/Edge recommended).
          </p>
          {!captioning ? (
            <Button onClick={startCaptioning} disabled={!ready}>
              🎙️ Start captioning
            </Button>
          ) : (
            <Button variant="danger" onClick={stopCaptioning}>
              ⏹ Stop
            </Button>
          )}
          {interim && <p className="text-xs text-white/60 mt-2">Listening: {interim}</p>}
          {state.captions.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
              {state.captions.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs bg-white/5 rounded-lg px-2 py-1.5">
                  <span className="text-white/40 tabular-nums">{c.start.toFixed(1)}s</span>
                  <span className="flex-1 truncate">{c.text}</span>
                  <button
                    className="text-red-400"
                    onClick={() => setState((s) => ({ ...s, captions: s.captions.filter((x) => x.id !== c.id) }))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tool === 'filters' && (
        <Card>
          <SectionTitle icon="🎨" title="Filters" hint={`${VIDEO_FILTERS.length} presets`} />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {VIDEO_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => patch({ filter: f.key })}
                className="flex-shrink-0 text-center"
              >
                <div
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition ${
                    state.filter === f.key ? 'border-brand-400' : 'border-white/10'
                  }`}
                >
                  <img
                    src={state.poster || state.sourceUrl}
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
          <div className="mt-2">
            <Slider label="Background blur" value={state.blur} min={0} max={20} step={1} onChange={(v) => patch({ blur: v })} suffix="px" />
          </div>
        </Card>
      )}

      {tool === 'speed' && (
        <Card>
          <SectionTitle icon="⏩" title="Speed Control" />
          <div className="flex gap-2 flex-wrap mb-3">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <Chip key={s} active={state.speed === s} onClick={() => patch({ speed: s })}>
                {s}x
              </Chip>
            ))}
          </div>
          <Slider label="Speed" value={state.speed} min={0.5} max={2} step={0.05} onChange={(v) => patch({ speed: v })} format={(v) => `${v}x`} />
        </Card>
      )}

      {tool === 'export' && (
        <Card>
          <SectionTitle icon="📤" title="Export & Share" />
          <p className="text-xs text-white/50 mb-3">Aspect ratio for the exported frame:</p>
          <div className="flex gap-2 mb-3">
            {ASPECT_PRESETS.map((a) => (
              <Chip key={a.key} active={state.aspect === a.key} onClick={() => patch({ aspect: a.key })}>
                {a.label}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportFrame} disabled={exporting}>
              {exporting ? <Spinner className="h-4 w-4" /> : '📥 Export frame'}
            </Button>
            <Button variant="outline" onClick={saveProject}>
              💾 Save project
            </Button>
          </div>
          <p className="text-[10px] text-white/40 mt-3">
            Exports a 1080p preview frame with all overlays. For full video render with music, use the Save project option.
          </p>
          <div className="mt-2 text-center">
            <PexelsCredit />
          </div>
        </Card>
      )}

      {/* Modals */}
      {showPexels && <PexelsVideoPicker onPick={pickPexels} onClose={() => setShowPexels(false)} />}
      {showStickers && <StickerPicker onPick={addSticker} onClose={() => setShowStickers(false)} />}
      {showMusic && (
        <MusicPicker
          onPick={(t) => patch({ musicTrack: t })}
          onClose={() => setShowMusic(false)}
        />
      )}
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
