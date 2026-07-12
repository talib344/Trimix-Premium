import { useRef } from 'react';
import { FREE_MUSIC } from '../../lib/constants';
import { Button } from '../ui';

export function MusicPicker({
  onPick,
  onClose,
}: {
  onPick: (track: { name: string; url: string }) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.includes('audio')) return;
    const url = URL.createObjectURL(f);
    onPick({ name: f.name.replace(/\.[^.]+$/, ''), url });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="glass rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Add Music</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        <Button variant="outline" className="w-full mb-4" onClick={() => fileRef.current?.click()}>
          ⬆️ Upload your MP3
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/*"
          onChange={handleFile}
          className="hidden"
        />

        <p className="text-xs text-white/50 mb-2">Free music library</p>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar">
          {FREE_MUSIC.map((t) => (
            <button
              key={t.url}
              onClick={() => {
                onPick(t);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left"
            >
              <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-sm">
                🎵
              </span>
              <span className="text-sm flex-1">{t.name}</span>
              <span className="text-white/40 text-xs">Free</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-white/40 text-center">
          Music from Pixabay (royalty-free). Internet required to stream.
        </p>
      </div>
    </div>
  );
}
