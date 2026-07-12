// Web Speech API helpers (SpeechSynthesis for TTS, webkitSpeechRecognition for STT).
// Browser-only; gracefully degrades when unavailable.

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function sttAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!ttsAvailable()) return [];
  return window.speechSynthesis.getVoices();
}

/** Wait for voices to load (Chrome loads async). */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!ttsAvailable()) return resolve([]);
    const existing = getVoices();
    if (existing.length) return resolve(existing);
    const handler = () => {
      resolve(getVoices());
      window.speechSynthesis.onvoiceschanged = null;
    };
    window.speechSynthesis.onvoiceschanged = handler;
    // Fallback timeout
    setTimeout(() => resolve(getVoices()), 1200);
  });
}

export interface SpeakOptions {
  voiceURI?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: SpeechSynthesisErrorEvent) => void;
}

export function speak(text: string, opts: SpeakOptions = {}): SpeechSynthesisUtterance | null {
  if (!ttsAvailable() || !text.trim()) {
    opts.onEnd?.();
    return null;
  }
  const u = new SpeechSynthesisUtterance(text);
  if (opts.voiceURI) {
    const v = getVoices().find((v) => v.voiceURI === opts.voiceURI);
    if (v) u.voice = v;
  }
  u.rate = opts.rate ?? 1;
  u.pitch = opts.pitch ?? 1;
  u.volume = opts.volume ?? 1;
  u.lang = opts.lang ?? 'ur-PK';
  if (opts.onStart) u.onstart = opts.onStart;
  if (opts.onEnd) u.onend = opts.onEnd;
  if (opts.onError) u.onerror = opts.onError;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return u;
}

export function stopSpeaking(): void {
  if (ttsAvailable()) window.speechSynthesis.cancel();
}

/** Best-effort pick of an Urdu voice. */
export function pickUrduVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => /ur/i.test(v.lang)) ||
    voices.find((v) => /urdu/i.test(v.name)) ||
    voices.find((v) => /hi/i.test(v.lang)) ||
    voices.find((v) => /hindi/i.test(v.name))
  );
}

// ---- Speech-to-Text (for auto captions) ----

export interface RecognitionHandlers {
  onResult: (text: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
}

function getRecognitionCtor(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function createRecognition(handlers: RecognitionHandlers, lang = 'ur-PK') {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    handlers.onError?.('Speech recognition not supported in this browser.');
    return null;
  }
  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;
  rec.onstart = () => handlers.onStart?.();
  rec.onend = () => handlers.onEnd?.();
  rec.onerror = (e: any) => handlers.onError?.(e?.error || 'recognition error');
  rec.onresult = (e: any) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (final) handlers.onResult(final, true);
    else if (interim) handlers.onResult(interim, false);
  };
  return rec;
}
