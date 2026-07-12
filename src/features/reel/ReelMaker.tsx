import { useEffect, useRef, useState } from 'react';
import type {
  PexelsVideo,
  ReelProjectData,
  ReelScript,
  SavedProject,
} from '../../lib/types';
import { uid } from '../../lib/types';
import { generateScript, scriptToSpoken, scriptToText } from '../../lib/scriptGen';
import { loadVoices, pickUrduVoice, speak, stopSpeaking, ttsAvailable } from '../../lib/speech';
import { loadProjects, upsertProject } from '../../lib/projects';
import { captureVideoFrame, downloadUrl } from '../../lib/export';
import { shareMedia } from '../../lib/share';
import { Button, Card, SectionTitle, Slider, Spinner, EmptyState } from '../../components/ui';
import { PexelsVideoPicker } from '../../components/editors/PexelsVideoPicker';
import { MusicPicker } from '../../components/editors/MusicPicker';
import { PexelsCredit } from '../../components/editors/PexelsCredit';

const EMPTY_SCRIPT: ReelScript = { hook: '', point1: '', point2: '', point3: '', cta: '' };

const DEFAULT_DATA: ReelProjectData = {
  topic: '',
  language: 'urdu',
  script: { ...EMPTY_SCRIPT },
  voiceText: '',
  rate: 0.95,
  pitch: 1,
  video: undefined,
  musicTrack: undefined,
  musicVolume: 0.4,
  textOverlays: [],
};

export function ReelMaker({
  initialProject,
  onSaved,
}: {
  initialProject: SavedProject | null;
  onSaved: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [data, setData] = useState<ReelProjectData>(DEFAULT_DATA);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>('');
  const [speaking, setSpeaking] = useState(false);
  const [showPexels, setShowPexels] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadVoices().then((vs) => {
      setVoices(vs);
      const ur = pickUrduVoice(vs);
      setVoiceURI(ur?.voiceURI ?? vs[0]?.voiceURI ?? '');
    });
  }, []);

  useEffect(() => {
    if (initialProject?.type === 'reel') {
      setData({ ...DEFAULT_DATA, ...(initialProject.data as ReelProjectData) });
    }
  }, [initialProject]);

  const patch = (p: Partial<ReelProjectData>) => setData((d) => ({ ...d, ...p }));

  function handleGenerateScript() {
    if (!data.topic.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const script = generateScript(data.topic, data.language);
      patch({ script, voiceText: scriptToSpoken(script) });
      setGenerating(false);
    }, 600);
  }

  function handleSpeak() {
    if (!data.voiceText.trim()) return;
    if (!ttsAvailable()) {
      alert('Text-to-speech needs the Web Speech API. Try Chrome or Edge.');
      return;
    }
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(data.voiceText, {
      voiceURI,
      rate: data.rate,
      pitch: data.pitch,
      lang: 'ur-PK',
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(scriptToText(data.script));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Could not copy. Select the text manually.');
    }
  }

  function pickPexelsVideo(v: PexelsVideo) {
    patch({ video: v, pexelsUser: v.user });
  }

  async function generateReel() {
    if (!data.video) {
      alert('Add a Pexels background video first (Step 4).');
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = Math.min(1, v.duration / 2);
      await new Promise((r) => setTimeout(r, 300));
      const frame = await captureVideoFrame(v, {
        filter: 'none',
        textOverlays: data.textOverlays,
        stickers: [],
        aspect: '9:16',
      });
      downloadUrl(frame, `trimix-reel-${Date.now()}.jpg`);
      await shareMedia({
        title: 'Trimix AI Reel',
        text: scriptToText(data.script),
        dataUrl: frame,
        filename: 'trimix-reel.jpg',
      });
    } catch (e: any) {
      alert(`Generate failed: ${e?.message || e}`);
    }
  }

  async function saveProject() {
    if (!data.topic && !data.video) return;
    const list = loadProjects();
    upsertProject(list, {
      id: initialProject?.id,
      type: 'reel',
      name: data.topic.slice(0, 32) || 'AI Reel',
      thumbnail: data.video?.image,
      data: { ...data, voiceURI },
    });
    onSaved();
    alert('Reel project saved!');
  }

  const stepDone = (n: number) => {
    if (n <= 1) return data.topic.trim().length > 0;
    if (n === 2) return !!data.script.hook;
    if (n === 3) return speaking || !!data.voiceText;
    if (n === 4) return !!data.video;
    if (n === 5) return !!data.video && !!data.script.hook;
    return false;
  };

  const urduVoices = voices.filter((v) => /ur|hi/i.test(v.lang) || /urdu|hindi/i.test(v.name));

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-brand-700/30 to-accent-600/20 border-brand-400/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✨</span>
          <div>
            <h2 className="text-lg font-bold">Create AI Reel</h2>
            <p className="text-xs text-white/60">No API key needed · Urdu & Roman Urdu · Free</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Topic */}
      <StepCard n={1} title="Write your topic" done={stepDone(1)}>
        <textarea
          value={data.topic}
          onChange={(e) => patch({ topic: e.target.value })}
          rows={2}
          placeholder="مثال: وقت کی اہمیت / Waqt ki ahmiyat"
          className="w-full bg-ink-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
        />
        <div className="flex gap-2 mt-2">
          {(['urdu', 'roman-urdu'] as const).map((l) => (
            <button
              key={l}
              onClick={() => patch({ language: l })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                data.language === l
                  ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white border-transparent'
                  : 'bg-white/5 text-white/60 border-white/10'
              }`}
            >
              {l === 'urdu' ? 'اردو' : 'Roman Urdu'}
            </button>
          ))}
        </div>
        <Button className="mt-3 w-full" onClick={handleGenerateScript} disabled={!data.topic.trim() || generating}>
          {generating ? <Spinner className="h-4 w-4" /> : '✨ Generate script'}
        </Button>
      </StepCard>

      {/* Step 2: Script template */}
      {data.script.hook && (
        <StepCard n={2} title="Template script" done={stepDone(2)}>
          <div className="space-y-2">
            <ScriptField label="🪝 Hook" text={data.script.hook} urdu={data.language === 'urdu'} onChange={(t) => patch({ script: { ...data.script, hook: t } })} />
            <ScriptField label="1️⃣ Point 1" text={data.script.point1} urdu={data.language === 'urdu'} onChange={(t) => patch({ script: { ...data.script, point1: t }, voiceText: scriptToSpoken({ ...data.script, point1: t }) })} />
            <ScriptField label="2️⃣ Point 2" text={data.script.point2} urdu={data.language === 'urdu'} onChange={(t) => patch({ script: { ...data.script, point2: t }, voiceText: scriptToSpoken({ ...data.script, point2: t }) })} />
            <ScriptField label="3️⃣ Point 3" text={data.script.point3} urdu={data.language === 'urdu'} onChange={(t) => patch({ script: { ...data.script, point3: t }, voiceText: scriptToSpoken({ ...data.script, point3: t }) })} />
            <ScriptField label="📣 CTA" text={data.script.cta} urdu={data.language === 'urdu'} onChange={(t) => patch({ script: { ...data.script, cta: t }, voiceText: scriptToSpoken({ ...data.script, cta: t }) })} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="subtle" onClick={copyScript}>
              {copied ? '✓ Copied' : '📋 Copy script'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleGenerateScript} disabled={generating}>
              🔄 Regenerate
            </Button>
          </div>
        </StepCard>
      )}

      {/* Step 3: Voice */}
      {data.script.hook && (
        <StepCard n={3} title="Speak — Urdu voice" done={stepDone(3)}>
          {ttsAvailable() ? (
            <>
              {urduVoices.length > 0 && (
                <select
                  value={voiceURI}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  className="w-full bg-ink-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm mb-2"
                >
                  {urduVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {urduVoices.length === 0 && <option value="">Default voice</option>}
                </select>
              )}
              <Slider label="Rate" value={data.rate} min={0.5} max={1.5} step={0.05} onChange={(v) => patch({ rate: v })} format={(v) => `${v}x`} />
              <Slider label="Pitch" value={data.pitch} min={0.5} max={1.5} step={0.05} onChange={(v) => patch({ pitch: v })} format={(v) => v.toFixed(2)} />
              <Button className="mt-2 w-full" onClick={handleSpeak} variant={speaking ? 'danger' : 'brand'}>
                {speaking ? '⏹ Stop' : '🔊 Speak'}
              </Button>
              <p className="text-[10px] text-white/40 mt-2">
                Uses your browser's built-in voices. For better Urdu voices, install Urdu TTS in your OS.
              </p>
            </>
          ) : (
            <p className="text-xs text-amber-400">
              Web Speech API not available in this browser. The script is still copied — record voice in another app.
            </p>
          )}
        </StepCard>
      )}

      {/* Step 4: Pexels video */}
      {data.script.hook && (
        <StepCard n={4} title="Add Pexels background video" done={stepDone(4)}>
          {data.video ? (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-w-[260px] mx-auto bg-black">
                <video
                  ref={videoRef}
                  src={data.video.videoUrl}
                  poster={data.video.image}
                  crossOrigin="anonymous"
                  playsInline
                  muted
                  loop
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute top-2 right-2 text-[9px] bg-black/60 rounded px-1.5 py-0.5">
                  by {data.video.user}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowPexels(true)}>
                  Change video
                </Button>
                <Button size="sm" variant="danger" onClick={() => patch({ video: undefined, pexelsUser: undefined })}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowPexels(true)}>
              🎥 Search Pexels video
            </Button>
          )}
        </StepCard>
      )}

      {/* Step 5: Generate */}
      {data.script.hook && (
        <StepCard n={5} title="Generate Reel" done={stepDone(5)}>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowMusic(true)}>
              🎵 {data.musicTrack ? data.musicTrack.name : 'Add music'}
            </Button>
            {data.musicTrack && (
              <Button size="sm" variant="danger" onClick={() => patch({ musicTrack: undefined })}>
                Remove
              </Button>
            )}
          </div>
          {data.musicTrack && (
            <div className="mt-2">
              <Slider label="Music volume" value={data.musicVolume} min={0} max={1} step={0.05} onChange={(v) => patch({ musicVolume: v })} format={(v) => `${Math.round(v * 100)}%`} />
            </div>
          )}
          <audio ref={audioRef} src={data.musicTrack?.url} loop className="hidden" />
          <Button className="mt-3 w-full" onClick={generateReel} disabled={!data.video}>
            🎬 Generate Reel
          </Button>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button size="sm" variant="subtle" onClick={saveProject}>
              💾 Save project
            </Button>
            <Button size="sm" variant="subtle" onClick={copyScript}>
              {copied ? '✓ Copied' : '📋 Copy script'}
            </Button>
          </div>
          <p className="text-[10px] text-white/40 mt-2 text-center">
            Generate composes voice + video + text + music. Speak first to narrate, then export.
          </p>
          <div className="mt-2 text-center">
            <PexelsCredit />
          </div>
        </StepCard>
      )}

      {!data.script.hook && (
        <EmptyState
          icon="📝"
          title="Start with a topic"
          subtitle="Write what your reel is about. We'll generate a Hook · 3 Points · CTA script, an Urdu voiceover, and pair it with a free Pexels video."
        />
      )}

      {showPexels && <PexelsVideoPicker onPick={pickPexelsVideo} onClose={() => setShowPexels(false)} />}
      {showMusic && (
        <MusicPicker onPick={(t) => patch({ musicTrack: t })} onClose={() => setShowMusic(false)} />
      )}
    </div>
  );
}

function StepCard({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-slide-up">
      <SectionTitle
        icon={
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              done ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            {done ? '✓' : n}
          </span>
        }
        title={title}
      />
      {children}
    </Card>
  );
}

function ScriptField({
  label,
  text,
  urdu,
  onChange,
}: {
  label: string;
  text: string;
  urdu?: boolean;
  onChange: (t: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-white/50 block mb-1">{label}</label>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        dir={urdu ? 'rtl' : 'ltr'}
        className={`w-full bg-ink-900/80 border border-white/10 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-brand-400 ${
          urdu ? 'urdu' : ''
        }`}
      />
    </div>
  );
}
